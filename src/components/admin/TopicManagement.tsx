import React, { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import DatePicker from '@/components/ui/DatePicker';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/Dialog';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

interface Topic {
  _id: string;
  languageId: string | { _id: string; name: string }; // Can be ID or populated object
  languageName?: string;
  topic: string;
  date: string;
  scheduledDate?: string;
  language?: {
    _id: string;
    name: string;
  };
}

export const TopicManagement: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [languages, setLanguages] = useState<{ _id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTopicId, setCurrentTopicId] = useState('');
  const [newTopic, setNewTopic] = useState({
    languageId: '',
    topic: '',
    date: '',
    questionLevel: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    questionCount: 20
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [languagesData, topicsData] = await Promise.all([
          adminApi.getLanguages(),
          adminApi.getDailyTopics()
        ]);

        console.log('Languages:', JSON.stringify(languagesData, null, 2));
        console.log('Topics:', JSON.stringify(topicsData, null, 2));

        const formattedTopics = topicsData?.map((topic: any) => ({
          ...topic,
          date: topic.date ? new Date(topic.date).toISOString().split('T')[0] : ''
        })) || [];

        setTopics(formattedTopics);
        // Ensure we're setting the data property if it's an Axios response
        const languagesArray = Array.isArray(languagesData)
          ? languagesData
          : (languagesData?.data || []);
        setLanguages(languagesArray);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getDailyTopics();
      console.log('Topics API Response:', JSON.stringify(response, null, 2));
      setTopics(response || []); // Ensure we always have an array
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load topics');
      setTopics([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTopic.languageId || !newTopic.topic || !newTopic.date) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Ensure we have the correct values
      const topicData = {
        languageId: newTopic.languageId,
        topic: newTopic.topic,
        date: newTopic.date,
        questionLevel: newTopic.questionLevel || 'Medium',
        questionCount: newTopic.questionCount || 20
      };



      if (isEditing && currentTopicId) {
        await adminApi.updateDailyTopic(currentTopicId, topicData);
        toast.success('Topic updated successfully');
      } else {
        await adminApi.addDailyTopic(topicData);
        toast.success('Topic added successfully');
      }

      // Reset form
      setNewTopic({
        languageId: '',
        topic: '',
        date: '',
        questionLevel: 'Medium',
        questionCount: 20
      });
      setIsEditing(false);
      setCurrentTopicId('');
      fetchTopics();
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Something went wrong');
    }
  };

  const handleEdit = (topic: Topic) => {
    try {
      const editDate = topic.date ? new Date(topic.date).toISOString().split('T')[0] : '';
      setEditingTopic({
        ...topic,
        languageId: typeof topic.languageId === 'object'
          ? topic.languageId._id
          : topic.languageId,
        date: editDate,
        questionLevel: topic.questionLevel || 'Medium',
        questionCount: topic.questionCount || 20
      });
      setCurrentTopicId(topic._id);
      setIsEditing(true);
      setEditDialogOpen(true);
    } catch (error) {
      console.error('Error setting edit topic:', error);
      toast.error('Failed to prepare topic for editing');
    }
  };

  const handleDeleteClick = (id: string) => {
    setTopicToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminApi.deleteDailyTopic(topicToDelete);
      toast.success('Topic deleted successfully');
      fetchTopics();
    } catch (error) {
      toast.error('Failed to delete topic');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const getLanguageName = (topic: Topic) => {
    console.log('Getting language name for topic:', topic);

    // Case 1: languageId is a populated object
    if (topic.languageId && typeof topic.languageId === 'object') {
      return topic.languageId.name || 'No Name';
    }

    // Case 2: languageName is directly available
    if (topic.languageName) {
      return topic.languageName;
    }

    // Case 3: Try to find language by ID in the languages array
    if (topic.languageId) {
      const lang = languages.find(l => l._id === topic.languageId);
      if (lang) return lang.name;
    }

    // Case 4: Check for language object in the topic
    if (topic.language) {
      return topic.language.name || 'No Name';
    }

    console.warn('Could not determine language name for topic:', topic);
    return 'Unknown';
  };

  return (
    <ErrorBoundary>
      <>
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-xl font-semibold">Daily Topics</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <Select
                      value={newTopic.languageId}
                      onValueChange={(value) => setNewTopic({...newTopic, languageId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang._id} value={lang._id}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Topic</label>
                    <Input
                      placeholder="Enter topic"
                      value={newTopic.topic}
                      onChange={(e) => setNewTopic({...newTopic, topic: e.target.value})}
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Schedule Date</label>
                    <DatePicker
                      value={newTopic.date}
                      onChange={(date: string) => {
                        setNewTopic({ ...newTopic, date });
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Question Level</label>
                    <Select
                      value={newTopic.questionLevel || 'Medium'}
                      onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => {
                        setNewTopic({...newTopic, questionLevel: value});
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Question Count</label>
                    <Input
                      type="number"
                      min="15"
                      max="25"
                      placeholder="20"
                      value={newTopic.questionCount || 20}
                      onChange={(e) => {
                        const count = parseInt(e.target.value) || 20;
                        setNewTopic({...newTopic, questionCount: count});
                      }}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                      ) : isEditing ? 'Update Topic' : 'Add Topic'}
                    </Button>
                  </div>
                </div>
              </form>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 bg-gray-100 p-3 font-medium text-sm">
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Language</div>
                    <div className="col-span-3">Topic</div>
                    <div className="col-span-2">Level</div>
                    <div className="col-span-2">Questions</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                  {topics?.length > 0 ? (
                    topics.map((topic) => (
                      <div key={topic._id} className="grid grid-cols-12 p-3 border-b items-center text-sm">
                        <div className="col-span-2">{new Date(topic.date).toLocaleDateString()}</div>
                        <div className="col-span-2">{getLanguageName(topic)}</div>
                        <div className="col-span-3">{topic.topic}</div>
                        <div className="col-span-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            topic.questionLevel === 'Easy' ? 'bg-green-100 text-green-800' :
                            topic.questionLevel === 'Hard' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {topic.questionLevel || 'Medium'}
                          </span>
                        </div>
                        <div className="col-span-2">{topic.questionCount || 20}</div>
                        <div className="col-span-1 flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(topic)}
                            className="text-blue-600 hover:bg-blue-50 p-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(topic._id)}
                            className="text-red-600 hover:bg-red-50 p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-12 p-4 text-center text-gray-500">
                      No topics found
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this topic? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Topic</DialogTitle>
            </DialogHeader>
            {editingTopic && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <Select
                    value={typeof editingTopic.languageId === 'string' ? editingTopic.languageId : editingTopic.languageId?._id || ''}
                    onValueChange={(value) => setEditingTopic({...editingTopic, languageId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang._id} value={lang._id}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Topic</label>
                  <Input
                    value={editingTopic.topic}
                    onChange={(e) => setEditingTopic({...editingTopic, topic: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <DatePicker
                    value={editingTopic.date}
                    onChange={(date: string) => {
                      setEditingTopic({...editingTopic, date});
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Question Level</label>
                  <Select
                    value={editingTopic.questionLevel || 'Medium'}
                    onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => setEditingTopic({...editingTopic, questionLevel: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Question Count</label>
                  <Input
                    type="number"
                    min="15"
                    max="25"
                    value={editingTopic.questionCount || 20}
                    onChange={(e) => setEditingTopic({...editingTopic, questionCount: parseInt(e.target.value) || 20})}
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        if (!editingTopic) return;

                        // Validate required fields
                        if (!editingTopic.languageId || !editingTopic.topic || !editingTopic.date) {
                          toast.error('Please fill in all fields');
                          return;
                        }

                        // Format the payload
                        const payload = {
                          languageId: editingTopic.languageId,
                          topic: editingTopic.topic,
                          date: editingTopic.date,
                          questionLevel: editingTopic.questionLevel || 'Medium',
                          questionCount: editingTopic.questionCount || 20
                        };

                        const response = await adminApi.updateDailyTopic(editingTopic._id, payload);

                        if (response.status === 200) {
                          toast.success('Topic updated successfully');
                          setEditDialogOpen(false);
                          fetchTopics();
                        } else {
                          throw new Error(response.data?.msg || 'Update failed');
                        }
                      } catch (error: any) {
                        console.error('Update error:', error);
                        toast.error(error.response?.data?.msg || error.message || 'Failed to update topic');
                      }
                    }}
                  >
                    Update
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    </ErrorBoundary>
  );
};

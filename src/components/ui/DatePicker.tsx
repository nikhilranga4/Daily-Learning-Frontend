import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/ui/Button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
}

const DatePicker = React.forwardRef<ReactDatePicker, DatePickerProps>(
  ({ value, onChange }, ref) => {
    // Handle date parsing more safely
    const selectedDate = React.useMemo(() => {
      if (!value) return null;
      try {
        // Handle both YYYY-MM-DD and full ISO string formats
        const dateStr = value.includes('T') ? value : value + 'T00:00:00';
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
      } catch (error) {
        console.warn('Invalid date value:', value);
        return null;
      }
    }, [value]);

    const handleDateChange = React.useCallback((date: Date | null) => {
      if (date && !isNaN(date.getTime())) {
        // Ensure we get the local date in YYYY-MM-DD format
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        onChange(dateStr);
      } else {
        onChange('');
      }
    }, [onChange]);

    return (
      <div className="relative w-full">
        <ReactDatePicker
          ref={ref}
          selected={selectedDate}
          onChange={handleDateChange}
          customInput={
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          }
          popperPlacement="bottom-start"
          popperClassName="z-50"
          showPopperArrow={false}
          portalId="root-portal"
          withPortal
          dateFormat="yyyy-MM-dd"
          minDate={new Date()} // Prevent selecting past dates
        />
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;

import * as React from 'react';

declare module '@/components/ui/Dialog' {
  export function Dialog(props: {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
  }): JSX.Element | null;
  
  export function DialogContent(props: { children: React.ReactNode }): JSX.Element;
  export function DialogHeader(props: { children: React.ReactNode }): JSX.Element;
  export function DialogTitle(props: { children: React.ReactNode }): JSX.Element;
  export function DialogDescription(props: { children: React.ReactNode }): JSX.Element;
  export function DialogFooter(props: { children: React.ReactNode }): JSX.Element;
}

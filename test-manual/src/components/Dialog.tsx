import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { formatDate } from '../utils/date';
import { useAnalytics } from '../utils/analytics';

interface DialogProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomDialog({ title, children, isOpen, onClose }: DialogProps) {
  const { trackEvent } = useAnalytics();

  React.useEffect(() => {
    if (isOpen) {
      trackEvent('dialog_opened', { title });
    }
  }, [isOpen, title, trackEvent]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4">{title}</Dialog.Title>
          <div className="mb-4">{children}</div>
          <div className="text-sm text-gray-500">
            Last updated: {formatDate(new Date())}
          </div>
          <Dialog.Close className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
            ×
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 
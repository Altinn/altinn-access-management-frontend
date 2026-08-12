import { useRef, useEffect } from 'react';
import type { Request } from '../types';
import { RequestReviewModalContent } from './RequestReviewModalContent';

interface RequestReviewModalProps {
  request: Request | null;
  onClose: () => void;
}

export const RequestReviewModal = ({ request, onClose }: RequestReviewModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  // Open/close the dialog based on the request prop to allow for external control
  useEffect(() => {
    if (request) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [request]);

  return (
    <RequestReviewModalContent
      modalRef={modalRef}
      request={request}
      onClose={onClose}
    />
  );
};

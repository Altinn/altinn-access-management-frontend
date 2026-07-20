import { useRef, useEffect } from 'react';
import type { Request } from '../types';
import { HandledRequestModalContent } from './HandledRequestModalContent';
import type { HandledDirection } from './useHandledRequests';

interface HandledRequestModalProps {
  request: Request | null;
  direction: HandledDirection;
  onClose: () => void;
}

export const HandledRequestModal = ({ request, direction, onClose }: HandledRequestModalProps) => {
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
    <HandledRequestModalContent
      modalRef={modalRef}
      request={request}
      direction={direction}
      onClose={onClose}
    />
  );
};

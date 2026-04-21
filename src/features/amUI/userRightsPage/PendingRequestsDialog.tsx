import React, { useRef, useState } from 'react';
import { ArrowLeftIcon, HandshakeIcon } from '@navikt/aksel-icons';
import {
  DsButton,
  DsDialog,
  DsHeading,
  ListItem,
  Snackbar,
  SnackbarProvider,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';

interface PendingRequestsModalProps<T> {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  isModalOpen: boolean;
  onClose: () => void;
  heading: string;
  dialogClassName?: string;
  headingClassName?: string;
  closeButtonClassName?: string;
  backButtonClassName?: string;
  renderList: (args: { isSmallScreen: boolean; onSelect: (item: T) => void }) => React.ReactNode;
  renderSelected: (item: T) => React.ReactNode;
}

export function PendingRequestsModal<T>({
  modalRef,
  isModalOpen,
  onClose,
  heading,
  dialogClassName,
  headingClassName,
  closeButtonClassName,
  backButtonClassName,
  renderList,
  renderSelected,
}: PendingRequestsModalProps<T>) {
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      onClose={() => {
        setSelectedItem(null);
        onClose();
      }}
      className={dialogClassName}
    >
      {isModalOpen && (
        <SnackbarProvider>
          {selectedItem !== null ? (
            <>
              <DsButton
                variant='tertiary'
                className={backButtonClassName}
                onClick={() => setSelectedItem(null)}
              >
                <ArrowLeftIcon />
                {t('common.back')}
              </DsButton>
              {renderSelected(selectedItem)}
            </>
          ) : (
            <>
              <DsHeading
                data-size='xs'
                level={1}
                className={headingClassName}
              >
                {heading}
              </DsHeading>
              {renderList({
                isSmallScreen,
                onSelect: setSelectedItem,
              })}
            </>
          )}
          <Snackbar />
        </SnackbarProvider>
      )}
      {selectedItem === null && (
        <DsButton
          variant='primary'
          className={closeButtonClassName}
          onClick={() => modalRef.current?.close()}
        >
          {t('common.close')}
        </DsButton>
      )}
    </DsDialog>
  );
}

interface PendingRequestsDialogProps<T> extends Omit<
  PendingRequestsModalProps<T>,
  'modalRef' | 'isModalOpen' | 'onClose'
> {
  count: number;
}

export function PendingRequestsDialog<T>({
  count,
  heading,
  dialogClassName,
  headingClassName,
  closeButtonClassName,
  backButtonClassName,
  renderList,
  renderSelected,
}: PendingRequestsDialogProps<T>) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (count === 0) {
    return null;
  }

  return (
    <>
      <PendingRequestsModal
        modalRef={modalRef}
        isModalOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        heading={heading}
        dialogClassName={dialogClassName}
        headingClassName={headingClassName}
        closeButtonClassName={closeButtonClassName}
        backButtonClassName={backButtonClassName}
        renderList={renderList}
        renderSelected={renderSelected}
      />
      <ListItem
        title={t('delegation_modal.request.sent_requests_item')}
        description={t('delegation_modal.request.active_access_request', {
          count,
        })}
        icon={HandshakeIcon}
        linkIcon
        color='neutral'
        variant='tinted'
        border='solid'
        interactive
        containerAs='div'
        as='button'
        badge={isSmallScreen ? undefined : <div>{t('delegation_modal.request.view_requests')}</div>}
        onClick={() => {
          setIsModalOpen(true);
          modalRef.current?.showModal();
        }}
      />
    </>
  );
}

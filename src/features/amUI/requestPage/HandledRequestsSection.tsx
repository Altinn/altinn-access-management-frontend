import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsDetails, List } from '@altinn/altinn-components';
import { HandledDirection } from './HandledRequestModal/useHandledRequests';
import { useRestoreFocusContext } from '../common/RestoreFocus';
import { RequestListItem } from './RequestsTabPanel';
import { HandledRequestModal } from './HandledRequestModal/HandledRequestModal';
import { Request } from './types';
import classes from './RequestPage.module.css';
import { formatDateToNorwegian } from '@/resources/utils';

interface HandledRequestsSectionProps {
  handledRequests: Request[] | undefined;
  direction: HandledDirection;
}

export const HandledRequestsSection = ({
  handledRequests,
  direction,
}: HandledRequestsSectionProps) => {
  const { t } = useTranslation();
  const [openHandledRequest, setOpenHandledRequest] = useState<Request | null>(null);
  const restoreFocus = useRestoreFocusContext();

  const handleClose = () => {
    if (openHandledRequest) {
      restoreFocus?.requestFocus(openHandledRequest.id);
    }
    setOpenHandledRequest(null);
  };

  if (!handledRequests || handledRequests.length === 0) {
    return null;
  }

  return (
    <div className={classes.handledSection}>
      <DsDetails>
        <DsDetails.Summary>{t('request_page.handled_requests_title')}</DsDetails.Summary>
        <DsDetails.Content>
          <List>
            {handledRequests.map((request) => (
              <RequestListItem
                key={request.id}
                id={request.id}
                name={request.displayPartyName}
                type={request.displayPartyType}
                subUnit={request.isSubUnit}
                titleAs='span'
                linkIcon
                description={`${t('request_page.asked_for_number', { count: request.numberOfRequests })} (${formatDateToNorwegian(request.createdDate)})`}
                as='button'
                onClick={() => setOpenHandledRequest(request)}
                controls={
                  <div className={classes.requestItemBadge}>
                    {t('request_page.view_request', { count: request.numberOfRequests || 1 })}
                  </div>
                }
              />
            ))}
          </List>
        </DsDetails.Content>
      </DsDetails>
      <HandledRequestModal
        request={openHandledRequest}
        direction={direction}
        onClose={handleClose}
      />
    </div>
  );
};

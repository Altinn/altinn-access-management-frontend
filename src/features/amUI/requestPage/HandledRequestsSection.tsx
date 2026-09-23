import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsParagraph, List } from '@altinn/altinn-components';

import { formatDateToNorwegian } from '@/resources/utils';

import { useRestoreFocusContext } from '../common/RestoreFocus';
import { CollapsibleContainer } from '../common/CollapsibleContainer/CollapsibleContainer';

import { type HandledDirection } from './HandledRequestModal/useHandledRequests';
import { RequestListItem } from './RequestListItem';
import { HandledRequestModal } from './HandledRequestModal/HandledRequestModal';
import { type Request } from './types';
import classes from './RequestPage.module.css';
import { useFilteredRequests } from './useFilteredRequests';

interface HandledRequestsSectionProps {
  handledRequests: Request[] | undefined;
  direction: HandledDirection;
  searchString?: string;
}

export const HandledRequestsSection = ({
  handledRequests,
  direction,
  searchString = '',
}: HandledRequestsSectionProps) => {
  const { t } = useTranslation();
  const [openHandledRequest, setOpenHandledRequest] = useState<Request | null>(null);
  const restoreFocus = useRestoreFocusContext();
  const filteredRequests = useFilteredRequests(handledRequests, searchString);

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
      <CollapsibleContainer
        heading={t('request_page.handled_requests_title')}
        searchString={searchString}
      >
        {filteredRequests.length === 0 ? (
          <DsParagraph className={classes.noResults}>
            {t('request_page.no_search_results', { searchTerm: searchString })}
          </DsParagraph>
        ) : (
          <DsParagraph className={classes.handledDescription}>
            {t('request_page.handled_requests_description')}
          </DsParagraph>
        )}
        <List>
          {filteredRequests.map((request) => (
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
      </CollapsibleContainer>
      <HandledRequestModal
        request={openHandledRequest}
        direction={direction}
        onClose={handleClose}
      />
    </div>
  );
};

import { Button } from '@digdir/designsystemet-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PersonIcon } from '@navikt/aksel-icons';
import { useEffect } from 'react';

import { SingleRightPath } from '@/routes/paths';
import { Page, PageContainer, PageContent, PageHeader, RestartPrompter } from '@/components';
import { useFetchRecipientInfo, useMediaQuery } from '@/resources/hooks';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { resetServicesWithStatus } from '@/rtk/features/singleRights/singleRightsSlice';
import { GroupElements } from '@/components/GroupElements/GroupElements';
import { redirectToSevicesAvailableForUser } from '@/resources/utils';

import classes from './ReceiptPage.module.css';
import { ActionBarSection } from './ActionBarSection/ActionBarSection';

export const ReceiptPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSm = useMediaQuery('(max-width: 768px)');
  const [urlParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const processedDelegations = useAppSelector(
    (state) => state.singleRightsSlice.processedDelegations,
  );

  const {
    name: recipientName,
    userID,
    partyID,
  } = useFetchRecipientInfo(urlParams.get('userUUID'), urlParams.get('partyUUID'));

  useEffect(() => {
    void dispatch(resetServicesWithStatus());
  }, []);

  return (
    <PageContainer>
      <Page
        color='dark'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent>
          {processedDelegations.length < 1 ? (
            <RestartPrompter
              spacingBottom
              restartPath={`/${SingleRightPath.DelegateSingleRights}/${SingleRightPath.ChooseService}?${urlParams}`}
              title={t('common.an_error_has_occured')}
              ingress={t('api_delegation.delegations_not_registered')}
            />
          ) : (
            <>
              <div className={classes.actionBars}>
                <ActionBarSection recipientName={String(recipientName)} />
              </div>
              <GroupElements>
                <Button
                  onClick={() => redirectToSevicesAvailableForUser(userID, partyID)}
                  color={'first'}
                  fullWidth
                >
                  {t('common.finished')}
                </Button>
                <Button
                  onClick={() => {
                    navigate(
                      `/${SingleRightPath.DelegateSingleRights}/${SingleRightPath.ChooseService}?${urlParams}`,
                    );
                  }}
                  color={'first'}
                  variant={'secondary'}
                  fullWidth
                >
                  {t('single_rights.give_more_rights')}
                </Button>
              </GroupElements>
            </>
          )}
        </PageContent>
      </Page>
    </PageContainer>
  );
};

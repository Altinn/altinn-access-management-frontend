import { Alert, Button, Heading, Link, Paragraph, Spinner } from '@digdir/designsystemet-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';
import { PlusIcon, PencilIcon, XMarkOctagonIcon } from '@navikt/aksel-icons';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { resetState } from '@/rtk/features/apiDelegation/apiDelegationSlice';
import {
  fetchOverviewOrgsOffered,
  fetchOverviewOrgsReceived,
  restoreAllSoftDeletedItems,
  softDeleteAll,
  softRestoreAll,
  deleteOfferedApiDelegation,
  deleteReceivedApiDelegation,
  type OverviewOrg,
  type DeletionRequest,
} from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { useMediaQuery } from '@/resources/hooks';
import { ApiDelegationPath } from '@/routes/paths';
import { ErrorPanel } from '@/components';
import { resetChosenApis } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { getButtonIconSize } from '@/resources/utils';

import { LayoutState } from '../LayoutState';

import { OrgDelegationActionBar } from './OrgDelegationActionBar';
import classes from './OverviewPageContent.module.css';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';

export interface OverviewPageContentInterface {
  layout: LayoutState;
}

export const OverviewPageContent = ({
  layout = LayoutState.Offered,
}: OverviewPageContentInterface) => {
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const overviewOrgs = useAppSelector((state) => state.overviewOrg.overviewOrgs);
  const error = useAppSelector((state) => state.overviewOrg.error);
  const loading = useAppSelector((state) => state.overviewOrg.loading);
  const isSm = useMediaQuery('(max-width: 768px)');
  const [deletedItemsStatusMessage, setDeletedItemsStatusMessage] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchData: () => any;
  let overviewText: string;
  let accessesHeader: string;
  let noDelegationsInfoText: string;

  useEffect(() => {
    if (loading) {
      void fetchData();
    }
    handleSaveDisabled();
    dispatch(resetState());
    dispatch(resetChosenApis());
  }, [overviewOrgs, error]);

  switch (layout) {
    case LayoutState.Offered:
      fetchData = async () => await dispatch(fetchOverviewOrgsOffered());
      overviewText = t('api_delegation.api_overview_text');
      accessesHeader = t('api_delegation.you_have_delegated_accesses');
      noDelegationsInfoText = t('api_delegation.no_offered_api_delegations');
      break;
    case LayoutState.Received:
      fetchData = async () => await dispatch(fetchOverviewOrgsReceived());
      overviewText = t('api_delegation.api_received_overview_text');
      accessesHeader = t('api_delegation.you_have_received_accesses');
      noDelegationsInfoText = t('api_delegation.no_received_delegations');
      break;
  }

  const goToStartDelegation = () => {
    dispatch(restoreAllSoftDeletedItems());
    navigate('/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseApi);
  };

  const handleSaveDisabled = () => {
    for (const org of overviewOrgs) {
      if (org.isAllSoftDeleted) {
        setSaveDisabled(false);
        return;
      }
      for (const api of org.apiList) {
        if (api.isSoftDelete) {
          setSaveDisabled(false);
          return;
        }
      }
    }
    setSaveDisabled(true);
  };

  const handleSetIsEditable = () => {
    if (isEditable) {
      dispatch(restoreAllSoftDeletedItems());
    }
    setIsEditable(!isEditable);
  };

  const mapToDeletionRequest = (orgNr: string, apiId: string) => {
    const deletionRequest: DeletionRequest = {
      orgNr,
      apiId,
    };
    return deletionRequest;
  };

  const handleSave = () => {
    for (const org of overviewOrgs) {
      for (const item of org.apiList) {
        if (item.isSoftDelete) {
          if (layout === LayoutState.Offered) {
            void dispatch(deleteOfferedApiDelegation(mapToDeletionRequest(org.orgNumber, item.id)));
          } else if (layout === LayoutState.Received) {
            void dispatch(
              deleteReceivedApiDelegation(mapToDeletionRequest(org.orgNumber, item.id)),
            );
          }
        }
      }
    }
    setIsEditable(false);
  };

  const activeDelegations = () => {
    if (error.message) {
      return (
        <div className={classes.errorPanel}>
          <ErrorPanel
            title={t('api_delegation.data_retrieval_failed')}
            message={error.message}
            statusCode={error.statusCode}
          ></ErrorPanel>
        </div>
      );
    } else if (loading) {
      return (
        <div className={classes.spinnerContainer}>
          <Spinner
            title={t('common.loading')}
            variant='interaction'
          />
        </div>
      );
    } else if (overviewOrgs.length < 1) {
      return <h3 className={classes.noActiveDelegations}>{noDelegationsInfoText}</h3>;
    }
    return overviewOrgs.map((org: OverviewOrg) => (
      <div
        key={org.id}
        className={classes.actionBarWrapper}
      >
        <OrgDelegationActionBar
          organization={org}
          isEditable={isEditable}
          softDeleteAllCallback={() => {
            dispatch(softDeleteAll(org.id));
            setDeletedItemsStatusMessage(t('common.changes_made_msg'));
          }}
          softRestoreAllCallback={() => dispatch(softRestoreAll(org.id))}
          setScreenreaderMsg={() => setDeletedItemsStatusMessage(t('common.changes_made_msg'))}
          key={org.id}
        ></OrgDelegationActionBar>
      </div>
    ));
  };

  return (
    <div className={classes.overviewActionBarContainer}>
      {!isSm && <h2 className={classes.pageContentText}>{overviewText}</h2>}
      {layout === LayoutState.Offered && (
        <div className={classes.delegateNewButton}>
          <Button
            variant='secondary'
            onClick={goToStartDelegation}
            fullWidth={isSm}
            size='medium'
          >
            <PlusIcon fontSize={getButtonIconSize(true)} /> {t('api_delegation.delegate_new_api')}
          </Button>
        </div>
      )}
      <Alert
        severity='info'
        size='lg'
      >
        <Heading
          level={2}
          size='sm'
        >
          {t('api_delegation.card_title')}
        </Heading>
        <Paragraph>
          {t('api_delegation.api_panel_content')}{' '}
          <Link
            href='https://samarbeid.digdir.no/maskinporten/maskinporten/25'
            target='_blank'
            rel='noreferrer'
          >
            {t('common.maskinporten')}
          </Link>
        </Paragraph>
      </Alert>
      <StatusMessageForScreenReader>{deletedItemsStatusMessage}</StatusMessageForScreenReader>
      <div className={classes.explanatoryContainer}>
        {overviewOrgs.length > 0 && (
          <>
            {isSm ? (
              <h3 className={classes.apiSubheading}>{accessesHeader}</h3>
            ) : (
              <h2 className={classes.apiSubheading}>{accessesHeader}</h2>
            )}
            <div className={classes.editButton}>
              {!isEditable ? (
                <Button
                  variant='tertiary'
                  onClick={handleSetIsEditable}
                  size='medium'
                >
                  <PencilIcon fontSize={getButtonIconSize(true)} />{' '}
                  {t('api_delegation.edit_accesses')}
                </Button>
              ) : (
                <Button
                  variant='tertiary'
                  onClick={handleSetIsEditable}
                  size='medium'
                >
                  <XMarkOctagonIcon fontSize={getButtonIconSize(true)} /> {t('common.cancel')}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      <>{activeDelegations()}</>
      {isEditable && (
        <div className={classes.saveSection}>
          <Button
            disabled={saveDisabled}
            onClick={handleSave}
            color='success'
            fullWidth={isSm}
          >
            {t('api_delegation.save')}
          </Button>
        </div>
      )}
    </div>
  );
};

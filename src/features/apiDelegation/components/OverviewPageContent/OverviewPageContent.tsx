import { Alert, Button, Heading, Paragraph, Spinner } from '@digdir/designsystemet-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as React from 'react';
import { PlusIcon, PencilIcon, XMarkOctagonIcon } from '@navikt/aksel-icons';

import { useMediaQuery } from '@/resources/hooks';
import { ApiDelegationPath } from '@/routes/paths';
import { ErrorPanel } from '@/components';
import { getButtonIconSize } from '@/resources/utils';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import type {
  DeletionDto,
  OverviewOrg,
} from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgApi';
import {
  useDeleteApiDelegationBatchMutation,
  useFetchOverviewOrgsQuery,
} from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { LayoutState } from '../LayoutState';

import { OrgDelegationActionBar } from './OrgDelegationActionBar';
import classes from './OverviewPageContent.module.css';

export interface OverviewPageContentInterface {
  layout: LayoutState;
}

const useOverviewOrgs = (layout: LayoutState) => {
  const partyId = getCookie('AltinnPartyId');
  const {
    data: overviewOrgs,
    isLoading: loadingOverviewOrgs,
    error: fetchError,
  } = useFetchOverviewOrgsQuery({ partyId, layout });
  const [orgsToDelete, setOrgsToDelete] = useState<DeletionDto[]>([]);

  const softRestoreAll = (orgId?: string) => {
    if (orgId) {
      setOrgsToDelete(orgsToDelete.filter((o) => o.orgNr !== orgId));
    }
    setOrgsToDelete([]);
  };

  const softDeleteAll = (orgId?: string) => {
    if (orgId && overviewOrgs) {
      const orgToDelete = overviewOrgs.find((o) => orgId === o.id);
      setOrgsToDelete(
        orgToDelete ? orgToDelete.apiList.map((a) => ({ apiId: a.id, orgNr: orgId })) : [],
      );
    }
  };

  const softRestoreCallback = (orgId: string, apiId: string) => {
    const softDeleteCallback = () => {
      setOrgsToDelete(orgsToDelete.filter((o) => o.apiId !== apiId));
    };
    return softDeleteCallback;
  };

  const softDeleteCallback = (orgId: string, apiId: string) => {
    const softDeleteCallback = () => {
      setOrgsToDelete([...orgsToDelete, { apiId, orgNr: orgId }]);
    };
    return softDeleteCallback;
  };

  return {
    softRestoreAll,
    softDeleteAll,
    softRestoreCallback,
    softDeleteCallback,
    orgsToDelete,
    overviewOrgs,
    loadingOverviewOrgs,
    fetchError,
  };
};

export const OverviewPageContent = ({
  layout = LayoutState.Offered,
}: OverviewPageContentInterface) => {
  const [isEditable, setIsEditable] = useState(false);
  const { t } = useTranslation();

  const isSm = useMediaQuery('(max-width: 768px)');
  const [deletedItemsStatusMessage, setDeletedItemsStatusMessage] = useState('');

  const {
    softRestoreAll,
    softDeleteAll,
    softRestoreCallback,
    softDeleteCallback,
    overviewOrgs,
    orgsToDelete,
    loadingOverviewOrgs,
    fetchError,
  } = useOverviewOrgs(layout);

  const [
    BatchDeleteApiDelegationRequest,
    { data: revokeData, isLoading: isRevoking, error: revokeError },
  ] = useDeleteApiDelegationBatchMutation();

  const confirmRevoke = () => {
    const partyId = getCookie('AltinnPartyId');
    BatchDeleteApiDelegationRequest({
      apiDelegations: orgsToDelete,
      layout,
      partyId,
    });
  };

  const error = fetchError ?? revokeError;
  const loading = isRevoking || loadingOverviewOrgs;

  const handleSetIsEditable = (value: boolean) => () => {
    setIsEditable(value);
  };
  const activeDelegations = () => {
    if (error) {
      return (
        <div className={classes.errorPanel}>
          <ErrorPanel
            title={t('api_delegation.data_retrieval_failed')}
            message={'message' in error ? error.message : ''}
            statusCode={'status' in error ? error.status.toString() : ''}
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
    } else if (overviewOrgs && overviewOrgs.length < 1) {
      return (
        <h3 className={classes.noActiveDelegations}>
          {layout === LayoutState.Offered
            ? t('api_delegation.no_offered_api_delegations')
            : t('api_delegation.no_received_delegations')}
        </h3>
      );
    }
    return (
      overviewOrgs &&
      overviewOrgs.map((org: OverviewOrg) => (
        <div
          key={org.id}
          className={classes.actionBarWrapper}
        >
          <OrgDelegationActionBar
            organization={org}
            isEditable={isEditable}
            softDeleteAllCallback={() => {
              softDeleteAll(org.id);
              setDeletedItemsStatusMessage(t('common.changes_made_msg'));
            }}
            softRestoreAllCallback={() => softRestoreAll(org.id)}
            setScreenreaderMsg={() => setDeletedItemsStatusMessage(t('common.changes_made_msg'))}
            key={org.id}
            softRestoreCallback={softRestoreCallback}
            softDeleteCallback={softDeleteCallback}
          />
        </div>
      ))
    );
  };

  return (
    <div className={classes.overviewActionBarContainer}>
      {!isSm && (
        <h2 className={classes.pageContentText}>
          {layout === LayoutState.Offered
            ? t('api_delegation.api_overview_text')
            : t('api_delegation.api_received_overview_text')}
        </h2>
      )}
      {layout === LayoutState.Offered && (
        <div className={classes.delegateNewButton}>
          <Link
            // variant='secondary'
            to={ApiDelegationPath.OfferedApiDelegations}
            // onClick={goToStartDelegation}
            // fullWidth={isSm}
            // size='medium'
          >
            <PlusIcon fontSize={getButtonIconSize(true)} /> {t('api_delegation.delegate_new_api')}
          </Link>
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
            to='https://samarbeid.digdir.no/maskinporten/maskinporten/25'
            target='_blank'
            rel='noreferrer'
          >
            {t('common.maskinporten')}
          </Link>
        </Paragraph>
      </Alert>
      <StatusMessageForScreenReader>{deletedItemsStatusMessage}</StatusMessageForScreenReader>
      <div className={classes.explanatoryContainer}>
        {overviewOrgs && overviewOrgs.length > 0 && (
          <>
            <Heading
              level={3}
              size={isSm ? 'sm' : 'lg'}
              className={classes.apiSubheading}
            >
              {layout === LayoutState.Offered
                ? t('api_delegation.you_have_delegated_accesses')
                : t('api_delegation.you_have_received_accesses')}
            </Heading>

            <div className={classes.editButton}>
              <Button
                variant='tertiary'
                onClick={handleSetIsEditable(!isEditable)}
                size='medium'
              >
                {isEditable ? (
                  <>
                    <PencilIcon fontSize={getButtonIconSize(true)} />{' '}
                    {t('api_delegation.edit_accesses')}
                  </>
                ) : (
                  <>
                    <XMarkOctagonIcon fontSize={getButtonIconSize(true)} /> {t('common.cancel')}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
      <>{activeDelegations()}</>
      {isEditable && (
        <div className={classes.saveSection}>
          <Button
            disabled={loading}
            onClick={confirmRevoke}
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

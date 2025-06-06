import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import * as React from 'react';
import { PlusIcon, PencilIcon, XMarkOctagonIcon } from '@navikt/aksel-icons';
import { useDispatch } from 'react-redux';
import { DsSpinner, DsButton, DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';

import { DelegationType } from '../DelegationType';

import { OrgDelegationActionBar } from './OrgDelegationActionBar';
import classes from './OverviewPageContent.module.css';
import { useSoftDeleteApi } from './useSoftDeleteApi';

import { useMediaQuery } from '@/resources/hooks';
import { ApiDelegationPath } from '@/routes/paths';
import { ErrorPanel } from '@/components';
import { getButtonIconSize } from '@/resources/utils';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import type { OverviewOrg } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgApi';
import {
  useDeleteApiDelegationBatchMutation,
  useFetchOverviewOrgsQuery,
} from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { resetState } from '@/rtk/features/apiDelegation/apiDelegationSlice';
import { resetChosenApis } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';

export interface OverviewPageContentInterface {
  delegationType: DelegationType;
}

const useOverviewOrgs = (delegationType: DelegationType) => {
  const partyId = getCookie('AltinnPartyId');
  const {
    data: overviewOrgs,
    isLoading: loadingOverviewOrgs,
    error: fetchError,
  } = useFetchOverviewOrgsQuery({ partyId, delegationType });

  return {
    overviewOrgs,
    loadingOverviewOrgs,
    fetchError,
  };
};

export const OverviewPageContent = ({
  delegationType = DelegationType.Offered,
}: OverviewPageContentInterface) => {
  const [isEditable, setIsEditable] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSm = useMediaQuery('(max-width: 768px)');
  const [deletedItemsStatusMessage, setDeletedItemsStatusMessage] = useState('');

  const { overviewOrgs, loadingOverviewOrgs, fetchError } = useOverviewOrgs(delegationType);

  const [
    BatchDeleteApiDelegationRequest,
    {
      isLoading: isRevoking,
      error: revokeError,
      isSuccess: deletedItemsSuccess,
      data: deletedItems,
      reset: resetDeleteApiDelegationBatchMutation,
    },
  ] = useDeleteApiDelegationBatchMutation();

  React.useEffect(() => {
    if (!isRevoking && deletedItemsSuccess) {
      setIsEditable(false);
      softRestoreAll();
      setDeletedItemsStatusMessage(t('common.changes_made_msg'));
    }
  }, [deletedItemsSuccess, isRevoking]);

  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(resetState());
    dispatch(resetChosenApis());
  }, []);

  const {
    itemsToDelete,
    softRestoreAll,
    softDeleteAll,
    softRestoreItem,
    softDeleteItem,
    checkIfItemIsSoftDeleted,
    checkIfAllItmesAreSoftDeleted,
  } = useSoftDeleteApi(overviewOrgs || []);

  const confirmRevoke = async () => {
    const partyId = getCookie('AltinnPartyId');
    const res = resetDeleteApiDelegationBatchMutation();
    await res;
    BatchDeleteApiDelegationRequest({
      apiDelegations: itemsToDelete,
      delegationType,
      partyId,
    });
  };

  const error = fetchError ?? revokeError;
  const loading = isRevoking || loadingOverviewOrgs;

  const activeDelegations = () => {
    if (error) {
      return (
        <div className={classes.errorPanel}>
          <ErrorPanel
            title={t('api_delegation.data_retrieval_failed')}
            message={'message' in error ? error.message : ''}
            statusCode={'status' in error ? error.status.toString() : ''}
          />
        </div>
      );
    } else if (loading) {
      return (
        <div className={classes.spinnerContainer}>
          <DsSpinner aria-label={t('common.loading')} />
        </div>
      );
    } else if (overviewOrgs && overviewOrgs.length < 1) {
      return (
        <h3 className={classes.noActiveDelegations}>
          {delegationType === DelegationType.Offered
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
              softDeleteAll(org.orgNumber);
            }}
            softRestoreAllCallback={() => softRestoreAll(org.orgNumber)}
            setScreenreaderMsg={() => setDeletedItemsStatusMessage(t('common.changes_made_msg'))}
            key={org.id}
            softRestoreCallback={softRestoreItem}
            softDeleteCallback={softDeleteItem}
            checkIfItemIsSoftDeleted={checkIfItemIsSoftDeleted}
            checkIfAllItmesAreSoftDeleted={checkIfAllItmesAreSoftDeleted}
          />
        </div>
      ))
    );
  };

  return (
    <div className={classes.overviewActionBarContainer}>
      {!isSm && (
        <h2 className={classes.pageContentText}>
          {delegationType === DelegationType.Offered
            ? t('api_delegation.api_overview_text')
            : t('api_delegation.api_received_overview_text')}
        </h2>
      )}

      {delegationType === DelegationType.Offered && (
        <div className={classes.delegateNewButton}>
          <DsButton
            variant='secondary'
            onClick={() =>
              navigate(`/${ApiDelegationPath.OfferedApiDelegations}/${ApiDelegationPath.ChooseApi}`)
            }
            data-size='md'
          >
            <PlusIcon fontSize={getButtonIconSize(true)} /> {t('api_delegation.delegate_new_api')}
          </DsButton>
        </div>
      )}
      <DsAlert
        data-color='info'
        data-size='md'
      >
        <DsHeading
          level={2}
          data-size='sm'
          className={classes.alertHeading}
        >
          {t('api_delegation.card_title')}
        </DsHeading>
        <DsParagraph>
          {t('api_delegation.api_panel_content')}{' '}
          <Link
            to='https://samarbeid.digdir.no/maskinporten/maskinporten/25'
            target='_blank'
            rel='noreferrer'
          >
            {t('common.maskinporten')}
          </Link>
        </DsParagraph>
      </DsAlert>
      {deletedItems && deletedItems?.failedDeleteions?.length > 0 && (
        <DsAlert
          role='alert'
          data-color='danger'
          title={t('api_delegation.revoke_delegation_failed')}
        >
          <DsHeading
            level={3}
            data-size='sm'
          >
            {t('api_delegation.revoke_delegation_failed')}
          </DsHeading>
          <ul>
            {deletedItems.failedDeleteions.map((item) => (
              <li key={item.apiId}>
                {item.apiId} {item.orgNumber},
              </li>
            ))}
          </ul>
        </DsAlert>
      )}
      <StatusMessageForScreenReader>{deletedItemsStatusMessage}</StatusMessageForScreenReader>
      <div className={classes.explanatoryContainer}>
        {overviewOrgs && overviewOrgs.length > 0 && (
          <>
            <DsHeading
              level={3}
              data-size={isSm ? 'sm' : 'md'}
              className={classes.apiSubheading}
            >
              {delegationType === DelegationType.Offered
                ? t('api_delegation.you_have_delegated_accesses')
                : t('api_delegation.you_have_received_accesses')}
            </DsHeading>

            <div className={classes.editButton}>
              <DsButton
                variant='tertiary'
                onClick={() => {
                  softRestoreAll();
                  setIsEditable(!isEditable);
                }}
                data-size='md'
              >
                {!isEditable ? (
                  <>
                    <PencilIcon fontSize={getButtonIconSize(true)} />{' '}
                    {t('api_delegation.edit_accesses')}
                  </>
                ) : (
                  <>
                    <XMarkOctagonIcon fontSize={getButtonIconSize(true)} /> {t('common.cancel')}
                  </>
                )}
              </DsButton>
            </div>
          </>
        )}
      </div>
      <>{activeDelegations()}</>
      {isEditable && (
        <div className={classes.saveSection}>
          <DsButton
            disabled={loading || itemsToDelete.length === 0}
            onClick={confirmRevoke}
            data-color='accent'
          >
            {t('api_delegation.save')}
          </DsButton>
        </div>
      )}
    </div>
  );
};

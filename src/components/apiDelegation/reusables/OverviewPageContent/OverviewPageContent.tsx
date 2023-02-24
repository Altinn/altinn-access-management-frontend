import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  Panel,
  PanelVariant,
} from '@altinn/altinn-design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ReactComponent as Add } from '@/assets/Add.svg';
import { ReactComponent as Edit } from '@/assets/Edit.svg';
import { ReactComponent as Error } from '@/assets/Error.svg';
import { RouterPath } from '@/routes/Router';
import { resetDelegationRequests } from '@/rtk/features/apiDelegation/delegationRequest/delegationRequestSlice';
import type { DelegableOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import {
  resetDelegableOrgs,
  softAddOrg,
  populateDelegableOrgs,
} from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import {
  fetchOverviewOrgsOffered,
  fetchOverviewOrgsReceived,
  restoreAllSoftDeletedItems,
  softDeleteAll,
  softRestoreAll,
  deleteOfferedApiDelegation,
  deleteReceivedApiDelegation,
} from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import type {
  DeletionRequest,
  OverviewOrg,
} from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { resetDelegableApis } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';

import { LayoutState } from '../LayoutState';

import { OrgDelegationAccordion } from './OrgDelegationAccordion';
import classes from './OverviewPageContent.module.css';

export interface OverviewPageContentInterface {
  layout: LayoutState;
}

export const OverviewPageContent = ({
  layout = LayoutState.Offered,
}: OverviewPageContentInterface) => {
  const [disabled, setDisabled] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const overviewOrgs = useAppSelector((state) => state.overviewOrg.overviewOrgs);
  const error = useAppSelector((state) => state.overviewOrg.error);
  const loading = useAppSelector((state) => state.overviewOrg.loading);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchData: () => any;
  let overviewText: string;
  let accessesHeader: string;

  useEffect(() => {
    if (loading) {
      void fetchData();
    }
    handleSetDisabled();
    dispatch(resetDelegableApis());
    dispatch(resetDelegableOrgs());
    dispatch(resetDelegationRequests());
  }, [overviewOrgs, error]);

  switch (layout) {
    case LayoutState.Offered:
      fetchData = () => dispatch(fetchOverviewOrgsOffered());
      overviewText = t('api_delegation.api_overview_text');
      accessesHeader = t('api_delegation.you_have_delegated_accesses');
      break;
    case LayoutState.Received:
      fetchData = () => dispatch(fetchOverviewOrgsReceived());
      overviewText = t('api_delegation.api_received_overview_text');
      accessesHeader = t('api_delegation.you_have_received_accesses');
      break;
  }

  const transferDelegableOrgs = () => {
    const delegableOrgList: DelegableOrg[] = [];
    for (const org of overviewOrgs) {
      delegableOrgList.push({
        id: org.id,
        orgName: org.orgName,
        orgNr: org.orgNr,
      });
    }
    dispatch(populateDelegableOrgs(delegableOrgList));
  };

  const delegateToSpecificOrg = (org: OverviewOrg) => {
    transferDelegableOrgs();
    dispatch(softAddOrg(org));
    navigate('/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.OfferedApiChooseApi);
  };

  const newDelegation = () => {
    transferDelegableOrgs();
    navigate('/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.OfferedApiChooseOrg);
  };

  const handleSetDisabled = () => {
    for (const org of overviewOrgs) {
      if (org.isAllSoftDeleted) {
        return setDisabled(false);
      }
      for (const api of org.apiList) {
        if (api.isSoftDelete) {
          return setDisabled(false);
        }
      }
    }
    return setDisabled(true);
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
            void dispatch(deleteOfferedApiDelegation(mapToDeletionRequest(org.orgNr, item.id)));
          } else if (layout === LayoutState.Received) {
            void dispatch(deleteReceivedApiDelegation(mapToDeletionRequest(org.orgNr, item.id)));
          }
        }
      }
    }
  };

  const accordions = () => {
    if (error) {
      return (
        <div className={classes.errorPanel}>
          <Panel
            title={t('api_delegation.data_retrieval_failed')}
            variant={PanelVariant.Error}
            forceMobileLayout
          >
            <div>
              {t('api_delegation.error_message')}: {error}
            </div>
          </Panel>
        </div>
      );
    } else if (loading) {
      return t('api_delegation.loading') + '...';
    }
    return overviewOrgs.map((org) => (
      <OrgDelegationAccordion
        key={org.id}
        organization={org}
        isEditable={isEditable}
        softDeleteAllCallback={() => dispatch(softDeleteAll(org.id))}
        softRestoreAllCallback={() => dispatch(softRestoreAll(org.id))}
        delegateToOrgCallback={
          layout === LayoutState.Offered ? () => delegateToSpecificOrg(org) : undefined
        }
      ></OrgDelegationAccordion>
    ));
  };

  return (
    <div className={classes.pageContent}>
      <div className={classes.overviewAccordionsContainer}>
        <h2 className={classes.pageContentText}>{overviewText}</h2>
        {layout === LayoutState.Offered && (
          <div className={classes.delegateNewButton}>
            <Button
              variant={ButtonVariant.Outline}
              onClick={newDelegation}
              icon={<Add />}
            >
              {t('api_delegation.delegate_new_org')}
            </Button>
          </div>
        )}
        <Panel title={t('api_delegation.card_title')}>
          {t('api_delegation.api_panel_content')}{' '}
          <a
            className={classes.link}
            href='https://samarbeid.digdir.no/maskinporten/maskinporten/25'
          >
            {t('common.maskinporten')}
          </a>
        </Panel>
        <div>
          {overviewOrgs.length > 0 && (
            <div className={classes.pageContentContainer}>
              <h2 className={classes.apiSubheading}>{accessesHeader}</h2>
              <div className={classes.editButton}>
                {!isEditable ? (
                  <Button
                    variant={ButtonVariant.Quiet}
                    icon={<Edit />}
                    onClick={handleSetIsEditable}
                    size={ButtonSize.Small}
                  >
                    {t('api_delegation.edit_accesses')}
                  </Button>
                ) : (
                  <Button
                    variant={ButtonVariant.Quiet}
                    icon={<Error />}
                    onClick={handleSetIsEditable}
                    size={ButtonSize.Small}
                  >
                    {t('api_delegation.cancel')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className={classes.accordion}>{accordions()}</div>
        {isEditable && (
          <div className={classes.saveSection}>
            <Button
              disabled={disabled}
              onClick={handleSave}
              color={ButtonColor.Success}
            >
              {t('api_delegation.save')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

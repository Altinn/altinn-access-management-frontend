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
import type { OverviewOrg } from '@/rtk/features/overviewOrg/overviewOrgSlice';
import {
  fetchOverviewOrgsOutbound,
  fetchOverviewOrgsInbound,
  restoreAllSoftDeletedItems,
  save,
  softDeleteAll,
  softRestoreAll,
} from '@/rtk/features/overviewOrg/overviewOrgSlice';
import { ReactComponent as Add } from '@/assets/Add.svg';
import { ReactComponent as Edit } from '@/assets/Edit.svg';
import { ReactComponent as Error } from '@/assets/Error.svg';
import {
  resetDelegableOrgs,
  softAddOrg,
  populateDelegableOrgs,
} from '@/rtk/features/delegableOrg/delegableOrgSlice';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { resetDelegableApis } from '@/rtk/features/delegableApi/delegableApiSlice';
import { RouterPath } from '@/routes/Router';

import { LayoutState } from '../LayoutState';

import { OrgDelegationAccordion } from './OrgDelegationAccordion';
import classes from './OverviewPageContent.module.css';

export interface OverviewPageContentInterface {
  layout: LayoutState;
}

export const OverviewPageContent = ({
  layout = LayoutState.Given,
}: OverviewPageContentInterface) => {
  const [disabled, setDisabled] = useState(true);
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

  switch (layout) {
    case LayoutState.Given:
      fetchData = () => dispatch(fetchOverviewOrgsOutbound());
      overviewText = t('api_delegation.api_overview_text');
      accessesHeader = t('api_delegation.you_have_delegated_accesses');
      break;
    case LayoutState.Received:
      fetchData = () => dispatch(fetchOverviewOrgsInbound());
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
    navigate('/' + RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiChooseApi);
  };

  const newDelegation = () => {
    transferDelegableOrgs();
    navigate('/' + RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiChooseOrg);
  };

  useEffect(() => {
    handleSetDisabled();
    dispatch(resetDelegableApis());
    dispatch(resetDelegableOrgs());
  });

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
    setDisabled(true);
  };

  useEffect(() => {
    if (loading) {
      void fetchData();
    }
  }, []);

  const accordions = () => {
    if (error) {
      return (
        <Panel
          title={t('api_delegation.data_retrieval_failed')}
          variant={PanelVariant.Error}
          forceMobileLayout
        >
          <div>
            {t('common.error_status_code')}: {error}
          </div>
        </Panel>
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
          layout === LayoutState.Given ? () => delegateToSpecificOrg(org) : undefined
        }
      ></OrgDelegationAccordion>
    ));
  };

  const handleSetIsEditable = () => {
    if (isEditable) {
      dispatch(restoreAllSoftDeletedItems());
    }
    setIsEditable(!isEditable);
  };

  return (
    <div className={classes.pageContent}>
      <div className={classes.overviewAccordionsContainer}>
        <h2 className={classes.pageContentText}>{overviewText}</h2>
        {layout === LayoutState.Given && (
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
          {t('api_delegation.api_panel_content')}
        </Panel>
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
        <div className={classes.accordion}>{accordions()}</div>
        {isEditable && (
          <div className={classes.saveSection}>
            <Button
              disabled={disabled}
              onClick={() => dispatch(save())}
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

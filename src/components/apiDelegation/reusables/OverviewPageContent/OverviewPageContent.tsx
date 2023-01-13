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

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type { OverviewOrg } from '@/rtk/features/overviewOrg/overviewOrgSlice';
import {
  restoreAllSoftDeletedItems,
  save,
  softDeleteAll,
  softRestoreAll,
  fetchOverviewOrgs,
} from '@/rtk/features/overviewOrg/overviewOrgSlice';
import { ReactComponent as Add } from '@/assets/Add.svg';
import { ReactComponent as Edit } from '@/assets/Edit.svg';
import { ReactComponent as Cancel } from '@/assets/Cancel.svg';
import { resetDelegableOrgs, softAddOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { resetDelegableApis } from '@/rtk/features/delegableApi/delegableApiSlice';

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
  const fetchData = async () => await dispatch(fetchOverviewOrgs());

  const delegateToSpecificOrg = (org: OverviewOrg) => {
    dispatch(softAddOrg(org));
    navigate('new-api-delegation');
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

  let overviewText = '';
  let accessesHeader = '';
  switch (layout) {
    case LayoutState.Given:
      overviewText = t('api_delegation.api_overview_text');
      accessesHeader = t('api_delegation.you_have_delegated_accesses');
      break;
    case LayoutState.Received:
      overviewText = t('api_delegation.api_received_overview_text');
      accessesHeader = t('api_delegation.you_have_received_accesses');
      break;
  }

  const accordions = () => {
    if (error) {
      return (
        <Panel
          title={t('api_delegation.data_retrieval_failed')}
          variant={PanelVariant.Error}
          forceMobileLayout
        >
          <div>{t('api_delegation.error_message')}: + error</div>
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
    <div className={classes.overviewAccordionsContainer}>
      <h2 className={classes.pageContentText}>{overviewText}</h2>
      {layout === LayoutState.Given && (
        <div className={classes.delegateNewButton}>
          <Button
            variant={ButtonVariant.Outline}
            onClick={() => navigate('new-org-delegation')}
            icon={<Add />}
          >
            {t('api_delegation.delegate_new_org')}
          </Button>
        </div>
      )}
      <Panel title={t('api_delegation.card_title')}>{t('api_delegation.api_panel_content')}</Panel>
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
              icon={<Cancel />}
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
  );
};

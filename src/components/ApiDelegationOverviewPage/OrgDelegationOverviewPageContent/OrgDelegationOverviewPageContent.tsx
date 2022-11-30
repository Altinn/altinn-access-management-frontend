import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  Panel,
} from '@altinn/altinn-design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import {
  restoreSoftDeletedItems,
  save,
  softDeleteAll,
  softRestoreAll,
} from '@/rtk/features/overviewOrg/overviewOrgSlice';
import { ReactComponent as Add } from '@/assets/Add.svg';
import { ReactComponent as Edit } from '@/assets/Edit.svg';

import { OrgDelegationAccordion } from './OrgDelegationAccordion';
import classes from './OrgDelegationOverviewPageContent.module.css';

export const OrgDelegationOverviewPageContent = () => {
  const overviewOrgs = useAppSelector((state) => state.overviewOrg.overviewOrgs);
  const [isEditable, setIsEditable] = useState(false);
  const dispatch = useAppDispatch();
  const [disabled, setDisabled] = useState(true);
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  useEffect(() => {
    handleSetDisabled();
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

  const accordions = overviewOrgs.map((org) => (
    <OrgDelegationAccordion
      key={org.id}
      organization={org}
      isEditable={isEditable}
      softDeleteAllCallback={() => dispatch(softDeleteAll(org.id))}
      softRestoreAllCallback={() => dispatch(softRestoreAll(org.id))}
    ></OrgDelegationAccordion>
  ));

  const handleSetIsEditable = () => {
    if (isEditable) {
      dispatch(restoreSoftDeletedItems());
    }
    setIsEditable(!isEditable);
  };

  return (
    <div className={classes.overviewAccordionsContainer}>
      <h2 className={classes.pageContentText}>{t('api_delegation.api_overview_text')}</h2>
      <div className={classes.delegateNewButton}>
        <Button
          variant={ButtonVariant.Outline}
          onClick={() => navigate('new-org')}
          svgIconComponent={<Add />}
        >
          {t('api_delegation.delegate_new_org')}
        </Button>
      </div>
      <Panel title={t('api_delegation.card_title')}>{t('api_delegation.api_panel_content')}</Panel>
      <div className={classes.pageContentContainer}>
        <h2 className={classes.apiSubheading}>{t('api_delegation.you_have_delegated_accesses')}</h2>
        <div className={classes.editButton}>
          {!isEditable ? (
            <Button
              variant={ButtonVariant.Quiet}
              svgIconComponent={<Edit />}
              onClick={handleSetIsEditable}
              size={ButtonSize.Small}
            >
              {t('api_delegation.edit_accesses')}
            </Button>
          ) : (
            <Button
              variant={ButtonVariant.Quiet}
              svgIconComponent={<Edit />}
              onClick={handleSetIsEditable}
              size={ButtonSize.Small}
            >
              {t('api_delegation.cancel')}
            </Button>
          )}
        </div>
      </div>
      <div className={classes.accordion}>{accordions}</div>
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

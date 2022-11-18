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
  save,
  setOverviewOrgIsEditable,
  softDeleteAll,
  softUndoAll,
} from '@/rtk/features/overviewOrg/overviewOrgSlice';
import { ReactComponent as Add } from '@/assets/Add.svg';
import { ReactComponent as Edit } from '@/assets/Edit.svg';

import { OrgDelegationAccordion } from './OrgDelegationAccordion';
import classes from './OrgDelegationOverviewPageContent.module.css';

export const OrgDelegationOverviewPageContent = () => {
  const overviewOrgs = useAppSelector((state) => state.overviewOrg.overviewOrgs);
  const softDeletedItems = useAppSelector((state) => state.overviewOrg.softDeletedItems);
  const isEditable = useAppSelector((state) => state.overviewOrg.overviewOrgIsEditable);
  const dispatch = useAppDispatch();
  const [disabled, setDisabled] = useState(true);
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  useEffect(() => {
    if (softDeletedItems.length >= 1) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  });

  const accordions = overviewOrgs.map((org) => (
    <OrgDelegationAccordion
      key={org.id}
      organization={org}
      isEditable={isEditable}
      softDeleteAllCallback={() => dispatch(softDeleteAll(org))}
      softUndoAllCallback={() => dispatch(softUndoAll(org))}
    ></OrgDelegationAccordion>
  ));

  return (
    <div className={classes.overviewAccordionsContainer}>
      <h2 className={classes.pageContentText}>{t('api_delegation.api_overview_text')}</h2>
      <div className={classes.delegateNewButton}>
        <Button
          variant={ButtonVariant.Outline}
          onClick={() => navigate('new-org')}
          svgIconComponent={<Add />}
          fullWidth
        >
          {t('api_delegation.delegate_new_org')}
        </Button>
      </div>
      <Panel title={'Programmeringsgrensesnitt - API'}>
        {t('api_delegation.api_panel_content')}
      </Panel>
      <div className={classes.pageContentContainer}>
        <h2 className={classes.apiSubheading}>{t('api_delegation.you_have_delegated_accesses')}</h2>
        <div className={classes.editButton}>
          <Button
            variant={ButtonVariant.Quiet}
            svgIconComponent={<Edit />}
            onClick={() => dispatch(setOverviewOrgIsEditable(!isEditable))}
            size={ButtonSize.Small}
          >
            Rediger tilganger
          </Button>
        </div>
      </div>
      <div className={classes.accordion}>{accordions}</div>
      <div className={classes.saveSection}>
        <Button
          disabled={disabled}
          onClick={() => dispatch(save())}
          color={ButtonColor.Success}
        >
          {t('api_delegation.save')}
        </Button>
      </div>
    </div>
  );
};

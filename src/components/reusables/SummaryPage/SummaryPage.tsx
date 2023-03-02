import {
  Page,
  PageContent,
  PageHeader,
  PageColor,
  Panel,
  PanelVariant,
} from '@altinn/altinn-design-system';
import { List, Button, ButtonVariant, ButtonColor } from '@digdir/design-system-react';
import type { Key } from 'react';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';

import { useAppDispatch } from '@/rtk/app/hooks';
import { ReactComponent as OfficeIcon } from '@/assets/Office1.svg';
import { ReactComponent as SettingsIcon } from '@/assets/Settings.svg';
import { CompactDeletableListItem } from '@/components/reusables';
import common from '@/resources/css/Common.module.css';
import type { ApiDelegation } from '@/rtk/features/apiDelegation/delegationRequest/delegationRequestSlice';
import type { DelegableOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import { softRemoveOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import { softRemoveApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import type { DelegableApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';

import { ListTextColor } from '../CompactDeletableListItem/CompactDeletableListItem';

import classes from './SummaryPage.module.css';

export interface SummaryPageProps {
  delegableApis?: DelegableApi[];
  delegableOrgs?: DelegableOrg[];
  failedDelegations?: ApiDelegation[];
  successfulDelegations?: ApiDelegation[];
  restartProcessPath: string;
  pageHeaderText: string;
  topListText?: string;
  bottomListText?: string;
  bottomText?: string;
  mainButton?: React.ReactNode;
  complementaryButton?: React.ReactNode;
  headerIcon: React.ReactNode;
  headerColor?: PageColor;
}

export const SummaryPage = ({
  delegableApis,
  delegableOrgs,
  failedDelegations,
  successfulDelegations,
  pageHeaderText,
  topListText,
  bottomListText,
  bottomText,
  mainButton,
  complementaryButton,
  headerIcon,
  restartProcessPath,
  headerColor = PageColor.Primary,
}: SummaryPageProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const delegableApiListItems = delegableApis?.map(
    (api: DelegableApi | ApiDelegation, index: Key) => {
      return (
        <CompactDeletableListItem
          key={index}
          startIcon={<SettingsIcon />}
          removeCallback={delegableApis.length > 1 ? () => dispatch(softRemoveApi(api)) : null}
          leftText={api.apiName}
          middleText={api.orgName}
        ></CompactDeletableListItem>
      );
    },
  );

  const delegableOrgListItems = delegableOrgs?.map(
    (org: DelegableOrg, index: Key | null | undefined) => {
      return (
        <CompactDeletableListItem
          key={index}
          startIcon={<OfficeIcon />}
          removeCallback={delegableOrgs.length > 1 ? () => dispatch(softRemoveOrg(org)) : null}
          leftText={org.orgName}
          middleText={org.orgNr}
        ></CompactDeletableListItem>
      );
    },
  );

  const failedDelegatedListItems = failedDelegations?.map(
    (apiDelegation: ApiDelegation, index: Key | null | undefined) => {
      return (
        <CompactDeletableListItem
          key={index}
          contentColor={ListTextColor.error}
          leftText={apiDelegation.apiName}
          middleText={apiDelegation.orgName}
        ></CompactDeletableListItem>
      );
    },
  );

  const successfulDelegatedItems = successfulDelegations?.map(
    (apiDelegation: ApiDelegation, index: Key | null | undefined) => {
      return (
        <CompactDeletableListItem
          key={index}
          leftText={apiDelegation.apiName}
          middleText={apiDelegation.orgName}
        ></CompactDeletableListItem>
      );
    },
  );

  const showTopSection = () => {
    return (
      (delegableApis !== null && delegableApis !== undefined && delegableApis?.length > 0) ||
      (failedDelegations !== null &&
        failedDelegations !== undefined &&
        failedDelegations?.length > 0)
    );
  };

  const showBottomSection = () => {
    return (
      (delegableOrgs !== null && delegableOrgs !== undefined && delegableOrgs?.length > 0) ||
      (successfulDelegations !== null &&
        successfulDelegations !== undefined &&
        successfulDelegations?.length > 0)
    );
  };

  const showErrorPanel = () => {
    return !showTopSection() && !showBottomSection();
  };

  return (
    <Page color={headerColor}>
      <PageHeader icon={headerIcon}>{pageHeaderText}</PageHeader>
      <PageContent>
        <div className={common.pageContent}>
          {showErrorPanel() ? (
            <Panel
              title={t('common.error')}
              variant={PanelVariant.Error}
            >
              <div>
                <p>{t('api_delegation.delegations_not_registered')}</p>
                <div className={classes.restartButton}>
                  <Button
                    variant={ButtonVariant.Outline}
                    color={ButtonColor.Danger}
                    onClick={() => navigate(restartProcessPath)}
                  >
                    {t('common.restart')}
                  </Button>
                </div>
              </div>
            </Panel>
          ) : (
            <div>
              {showTopSection() && (
                <div>
                  <h2 className={classes.listText}>{topListText}</h2>
                  {delegableApiListItems !== undefined && (
                    <List borderStyle={'dashed'}>{delegableApiListItems}</List>
                  )}
                  {failedDelegations !== undefined && (
                    <List borderStyle={'dashed'}>{failedDelegatedListItems}</List>
                  )}
                </div>
              )}
              {showBottomSection() && (
                <div>
                  <h2 className={classes.listText}>{bottomListText}</h2>
                  {delegableOrgs !== undefined && (
                    <List borderStyle={'dashed'}>{delegableOrgListItems}</List>
                  )}
                  {successfulDelegations !== undefined && (
                    <List borderStyle={'dashed'}>{successfulDelegatedItems}</List>
                  )}
                </div>
              )}
              <h3 className={classes.bottomText}>{bottomText}</h3>
              <div className={classes.navButtonContainer}>
                {complementaryButton && (
                  <div className={classes.previousButton}>{complementaryButton}</div>
                )}
                {mainButton && <div className={classes.confirmButton}>{mainButton}</div>}
              </div>
            </div>
          )}
        </div>
      </PageContent>
    </Page>
  );
};

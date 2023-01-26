import {
  Page,
  PageContent,
  PageHeader,
  List,
  BorderStyle,
  PageColor,
  Panel,
  PanelVariant,
  Button,
  ButtonVariant,
  ButtonColor,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';

import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softRemoveApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softRemoveOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { useAppDispatch } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { ReactComponent as OfficeIcon } from '@/assets/Office1.svg';
import { ReactComponent as SettingsIcon } from '@/assets/Settings.svg';
import { CompactDeletableListItem } from '@/components/reusables';
import type { ApiDelegation } from '@/rtk/features/delegationRequest/delegationRequestSlice';

import { ListTextColor } from '../CompactDeletableListItem/CompactDeletableListItem';

import classes from './ConfirmationPage.module.css';
export interface ConfirmationPageProps {
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

export const ConfirmationPage = ({
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
}: ConfirmationPageProps) => {
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
          removeCallback={
            failedDelegations.length > 1 ? () => dispatch(softRemoveOrg(apiDelegation)) : null
          }
          contentColor={ListTextColor.error}
          leftText={apiDelegation.orgName}
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
          removeCallback={
            successfulDelegations.length > 1 ? () => dispatch(softRemoveOrg(apiDelegation)) : null
          }
          leftText={apiDelegation.orgName}
          middleText={apiDelegation.orgName}
        ></CompactDeletableListItem>
      );
    },
  );

  const showErrorPanel = () => {
    return (
      delegableApis !== null &&
      delegableOrgs !== null &&
      (delegableApis === undefined ||
        delegableApis?.length < 1 ||
        delegableOrgs === undefined ||
        delegableOrgs?.length < 1) &&
      failedDelegations !== null &&
      successfulDelegations !== null &&
      (failedDelegations === undefined ||
        failedDelegations?.length < 1 ||
        successfulDelegations === undefined ||
        successfulDelegations?.length < 1)
    );
  };

  return (
    <Page color={headerColor}>
      <PageHeader icon={headerIcon}>{pageHeaderText}</PageHeader>
      <PageContent>
        <div className={classes.pageContent}>
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
              <div>
                <h2 className={classes.listText}>{topListText}</h2>
                {delegableApiListItems !== undefined && (
                  <List borderStyle={BorderStyle.Dashed}>{delegableApiListItems}</List>
                )}
                {failedDelegations !== undefined && (
                  <List borderStyle={BorderStyle.Dashed}>{failedDelegatedListItems}</List>
                )}
                <h2 className={classes.listText}>{bottomListText}</h2>
                {delegableOrgs !== undefined && (
                  <List borderStyle={BorderStyle.Dashed}>{delegableOrgListItems}</List>
                )}
                {successfulDelegations !== undefined && (
                  <List borderStyle={BorderStyle.Dashed}>{successfulDelegatedItems}</List>
                )}
              </div>
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

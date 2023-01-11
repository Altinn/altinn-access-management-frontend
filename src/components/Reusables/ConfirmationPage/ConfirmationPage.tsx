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

import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softRemoveApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softRemoveOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { useAppDispatch } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { ReactComponent as OfficeIcon } from '@/assets/Office1.svg';
import { ReactComponent as SettingsIcon } from '@/assets/Settings.svg';
import { CompactDeletableListItem } from '@/components/Reusables';
import type { ApiDelegation } from '@/rtk/features/DelegationRequest/DelegationRequestSlice';

import { ListTextColor } from '../CompactDeletableListItem/CompactDeletableListItem';

import classes from './ConfirmationPage.module.css';
export interface ConfirmationPageProps {
  topList: DelegableApi[] | ApiDelegation[];
  topListColor: ListTextColor;
  delegableOrgList?: DelegableOrg[];
  apiDelegationList?: ApiDelegation[];
  restartProcessPath?: string;
  pageHeaderText: string;
  topListContentHeader?: string;
  bottomListContentHeader?: string;
  bottomText?: string;
  mainButton?: React.ReactNode;
  complementaryButton?: React.ReactNode;
  headerIcon: React.ReactNode;
  headerColor?: PageColor;
}

export const ConfirmationPage = ({
  topList,
  topListColor = ListTextColor.error,
  delegableOrgList,
  apiDelegationList,
  pageHeaderText,
  topListContentHeader,
  bottomListContentHeader,
  bottomText,
  mainButton,
  complementaryButton,
  headerIcon,
  restartProcessPath,
  headerColor = PageColor.Primary,
}: ConfirmationPageProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const topListItems = topList.map((api: DelegableApi | ApiDelegation, index: Key) => {
    return (
      <CompactDeletableListItem
        key={index}
        startIcon={<SettingsIcon />}
        removeCallback={topList.length > 1 ? () => dispatch(softRemoveApi(api)) : null}
        leftText={api.apiName}
        middleText={api.orgName}
      ></CompactDeletableListItem>
    );
  });

  const delegableOrgListItems = delegableOrgList?.map(
    (org: DelegableOrg, index: Key | null | undefined) => {
      return (
        <CompactDeletableListItem
          key={index}
          startIcon={<OfficeIcon />}
          removeCallback={delegableOrgList.length > 1 ? () => dispatch(softRemoveOrg(org)) : null}
          leftText={org.orgName}
          middleText={org.orgNr}
        ></CompactDeletableListItem>
      );
    },
  );

  const apiDelegationListItems = apiDelegationList?.map(
    (apiDelegation: ApiDelegation, index: Key | null | undefined) => {
      return (
        <CompactDeletableListItem
          key={index}
          startIcon={<OfficeIcon />}
          removeCallback={
            apiDelegationList.length > 1 ? () => dispatch(softRemoveOrg(apiDelegation)) : null
          }
          leftText={apiDelegation.orgName}
          middleText={apiDelegation.orgName}
        ></CompactDeletableListItem>
      );
    },
  );

  return (
    <Page color={headerColor}>
      <PageHeader icon={headerIcon}>{pageHeaderText}</PageHeader>
      <PageContent>
        <div className={classes.pageContent}>
          {(topList.length < 1 ||
            delegableOrgList?.length === undefined ||
            delegableOrgList?.length < 1) &&
          restartProcessPath !== undefined ? (
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
                <h2>{topListContentHeader}</h2>
                {topListItems.length > 0 && (
                  <List borderStyle={BorderStyle.Dashed}>{topListItems}</List>
                )}
                <h2 className={classes.secondText}>{bottomListContentHeader}</h2>
                {delegableOrgList !== undefined && delegableOrgList.length > 0 && (
                  <List borderStyle={BorderStyle.Dashed}>
                    {delegableOrgList !== undefined &&
                      delegableOrgList.length > 0 &&
                      delegableOrgListItems}
                  </List>
                )}
                {apiDelegationList !== undefined && apiDelegationList.length > 0 && (
                  <List borderStyle={BorderStyle.Dashed}>
                    {apiDelegationList !== undefined &&
                      apiDelegationList.length > 0 &&
                      apiDelegationListItems}
                  </List>
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

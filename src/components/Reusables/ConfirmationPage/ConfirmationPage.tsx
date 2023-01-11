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
import { CompactDeletableListItem } from '@/components/Reusables/CompactDeletableListItem';

import classes from './ConfirmationPage.module.css';

export interface ConfirmationPageProps {
  apiList: DelegableApi[];
  orgList: DelegableOrg[];
  restartProcessPath?: string;
  pageHeaderText: string;
  apiListContentHeader?: string;
  orgListContentHeader?: string;
  bottomText?: string;
  mainButton?: React.ReactNode;
  complementaryButton?: React.ReactNode;
  headerIcon: React.ReactNode;
  color?: PageColor;
}

export const ConfirmationPage = ({
  apiList,
  orgList,
  pageHeaderText,
  apiListContentHeader,
  orgListContentHeader,
  bottomText,
  mainButton,
  complementaryButton,
  headerIcon,
  restartProcessPath,
  color = PageColor.Primary,
}: ConfirmationPageProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const apiListItems = apiList.map((api: DelegableApi, index: Key) => {
    return (
      <CompactDeletableListItem
        key={index}
        startIcon={<SettingsIcon />}
        removeCallback={apiList.length > 1 ? () => dispatch(softRemoveApi(api)) : null}
        leftText={api.apiName}
        middleText={api.orgName}
      ></CompactDeletableListItem>
    );
  });

  const orgListItems = orgList.map((org: DelegableOrg, index: Key | null | undefined) => {
    return (
      <CompactDeletableListItem
        key={index}
        startIcon={<OfficeIcon />}
        removeCallback={orgList.length > 1 ? () => dispatch(softRemoveOrg(org)) : null}
        leftText={org.orgName}
        middleText={org.orgNr}
      ></CompactDeletableListItem>
    );
  });

  return (
    <Page color={color}>
      <PageHeader icon={headerIcon}>{pageHeaderText}</PageHeader>
      <PageContent>
        <div className={classes.pageContent}>
          {(apiListItems.length < 1 || orgListItems.length < 1) &&
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
                <h2>{apiListContentHeader}</h2>
                {apiListItems.length > 0 && (
                  <List borderStyle={BorderStyle.Dashed}>{apiListItems}</List>
                )}
                <h2 className={classes.secondText}>{orgListContentHeader}</h2>
                {orgListItems.length > 0 && (
                  <List borderStyle={BorderStyle.Dashed}>{orgListItems}</List>
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

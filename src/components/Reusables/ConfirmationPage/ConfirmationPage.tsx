import {
  Page,
  PageContent,
  PageHeader,
  List,
  BorderStyle,
  PageColor,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';

import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softRemove as softRemoveApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softRemove as softRemoveOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { useAppDispatch } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { ReactComponent as OfficeIcon } from '@/assets/Office1.svg';
import { ReactComponent as SettingsIcon } from '@/assets/Settings.svg';
import { CompactDeletableListItem } from '@/components/Reusables/CompactDeletableListItem';

import classes from './ConfirmationPage.module.css';

export interface ConfirmationPageProps {
  apiList: DelegableApi[];
  orgList: DelegableOrg[];
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
  color = PageColor.Primary,
}: ConfirmationPageProps) => {
  const dispatch = useAppDispatch();

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
    <div>
      <div className={classes.page}>
        <Page color={color}>
          <PageHeader icon={headerIcon}>{pageHeaderText}</PageHeader>
          <PageContent>
            <div className={classes.pageContent}>
              <h2>{apiListContentHeader}</h2>
              {apiListItems.length > 0 && (
                <List borderStyle={BorderStyle.Dashed}>{apiListItems}</List>
              )}
              <h2 className={classes.secondText}>{orgListContentHeader}</h2>
              {apiListItems.length > 0 && (
                <List borderStyle={BorderStyle.Dashed}>{orgListItems}</List>
              )}
              <h3 className={classes.bottomText}>{bottomText}</h3>
              <div className={classes.navButtonContainer}>
                {complementaryButton && (
                  <div className={classes.previousButton}>{complementaryButton}</div>
                )}
                {mainButton && <div className={classes.confirmButton}>{mainButton}</div>}
              </div>
            </div>
          </PageContent>
        </Page>
      </div>
    </div>
  );
};

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
  firstListItems: DelegableApi[];
  secondListItems: DelegableOrg[];
  headerText: string;
  firstContentText?: string;
  secondContentText?: string;
  bottomText?: string;
  mainButton: React.ReactNode;
  complementaryButton: React.ReactNode;
  headerIcon: React.ReactNode;
  color?: PageColor;
}

export const ConfirmationPage = ({
  firstListItems,
  secondListItems,
  headerText,
  firstContentText,
  secondContentText,
  bottomText,
  mainButton,
  complementaryButton,
  headerIcon,
  color = PageColor.Primary,
}: ConfirmationPageProps) => {
  const dispatch = useAppDispatch();

  const apiListItems = firstListItems.map((api: DelegableApi, index: Key) => {
    return (
      <CompactDeletableListItem
        key={index}
        startIcon={<SettingsIcon />}
        removeCallback={firstListItems.length > 1 ? () => dispatch(softRemoveApi(api)) : null}
        firstText={api.apiName}
        secondText={api.orgName}
      ></CompactDeletableListItem>
    );
  });

  const orgListItems = secondListItems.map((org: DelegableOrg, index: Key | null | undefined) => {
    return (
      <CompactDeletableListItem
        key={index}
        startIcon={<OfficeIcon />}
        removeCallback={secondListItems.length > 1 ? () => dispatch(softRemoveOrg(org)) : null}
        firstText={org.orgName}
        secondText={org.orgNr}
      ></CompactDeletableListItem>
    );
  });

  return (
    <div>
      <div className={classes.page}>
        <Page>
          <PageHeader icon={headerIcon}>{headerText}</PageHeader>
          <PageContent>
            <div className={classes.pageContent}>
              <h2>{firstContentText}</h2>
              <List borderStyle={BorderStyle.Dashed}>{apiListItems}</List>
              <h2 className={classes.secondText}>{secondContentText}</h2>
              <List borderStyle={BorderStyle.Dashed}>{orgListItems}</List>
              <h3 className={classes.bottomText}>{bottomText}</h3>
              <div className={classes.navButtonContainer}>
                <div className={classes.previousButton}>{complementaryButton}</div>
                <div className={classes.confirmButton}>{mainButton}</div>
              </div>
            </div>
          </PageContent>
        </Page>
      </div>
    </div>
  );
};

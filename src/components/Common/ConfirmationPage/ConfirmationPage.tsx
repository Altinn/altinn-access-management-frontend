import {
  Page,
  PageContent,
  PageHeader,
  Button,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  List,
  BorderStyle,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useNavigate } from 'react-router-dom';

import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softRemove as softRemoveApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softRemove as softRemoveOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { useAppDispatch } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { ReactComponent as OfficeIcon } from '@/assets/Office1.svg';
import { ReactComponent as SettingsIcon } from '@/assets/Settings.svg';
import { ReactComponent as ApiIcon } from '@/assets/ShakeHands.svg';
import { CompactDeletableListItem } from '@/components/Common/CompactDeletableListItem';

import classes from './ConfirmationPage.module.css';

interface ConfirmationPageProps {
  firstListItems: DelegableApi[];
  secondListItems: DelegableOrg[];
  headerText: string;
  firstContentText?: string;
  secondContentText?: string;
  bottomText?: string;
  mainButton: React.ReactNode;
  complementaryButton: React.ReactNode;
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
}: ConfirmationPageProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
          <PageHeader icon={<ApiIcon />}>{headerText}</PageHeader>
          <PageContent>
            <div className={classes.pageContent}>
              <h2>{firstContentText}</h2>
              <List borderStyle={BorderStyle.Dashed}>{apiListItems}</List>
              <h2 className={classes.secondText}>{secondContentText}</h2>
              <List borderStyle={BorderStyle.Dashed}>{orgListItems}</List>
              <h3 className={classes.bottomText}>{bottomText}</h3>
              <div className={classes.navButtonContainer}>
                <div className={classes.previousButton}>
                  <Button
                    color={ButtonColor.Primary}
                    variant={ButtonVariant.Outline}
                    size={ButtonSize.Small}
                    onClick={() => navigate(-1)}
                  >
                    {complementaryButton}
                  </Button>
                </div>
                <div className={classes.confirmButton}>
                  <Button
                    color={ButtonColor.Success}
                    variant={ButtonVariant.Filled}
                    size={ButtonSize.Small}
                    onClick={() => navigate('/api-delegations/receipt')}
                  >
                    {mainButton}
                  </Button>
                </div>
              </div>
            </div>
          </PageContent>
        </Page>
      </div>
    </div>
  );
};

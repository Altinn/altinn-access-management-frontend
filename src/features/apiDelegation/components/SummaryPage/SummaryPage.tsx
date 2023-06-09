import { Panel, PanelVariant } from '@altinn/altinn-design-system';
import { List, Button, ButtonVariant, ButtonColor, ButtonSize } from '@digdir/design-system-react';
import type { Key } from 'react';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';
import cn from 'classnames';

import { useAppDispatch } from '@/rtk/app/hooks';
import { ReactComponent as OfficeIcon } from '@/assets/Office1.svg';
import { ReactComponent as SettingsIcon } from '@/assets/Settings.svg';
import {
  CompactDeletableListItem,
  NavigationButtons,
  Page,
  PageContent,
  PageHeader,
  PageColor,
  PageSize,
} from '@/components';
import common from '@/resources/css/Common.module.css';
import type { ApiDelegation } from '@/rtk/features/apiDelegation/delegationRequest/delegationRequestSlice';
import type { DelegableOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import { softRemoveOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import { softRemoveApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import type { DelegableApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { useMediaQuery } from '@/resources/hooks/useMediaQuery';
import { RouterPath } from '@/routes/Router';
import { setLoading as setOveviewToReload } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';

import { ListTextColor } from '../../../../components/CompactDeletableListItem/CompactDeletableListItem';

import classes from './SummaryPage.module.css';

export interface SummaryPageProps {
  delegableApis?: DelegableApi[];
  delegableOrgs?: DelegableOrg[];
  failedDelegations?: ApiDelegation[];
  successfulDelegations?: ApiDelegation[];
  restartProcessPath: string;
  pageHeaderText: string;
  headerIcon: React.ReactNode;
  headerColor?: PageColor;
  topListText?: string;
  failedDelegationText?: string;
  bottomListText?: string;
  bottomText?: string;
  confirmationButtonClick?: () => void;
  confirmationButtonDisabled?: boolean;
  confirmationButtonLoading?: boolean;
  showNavigationButtons?: boolean;
}

export const SummaryPage = ({
  delegableApis,
  delegableOrgs,
  failedDelegations,
  successfulDelegations,
  pageHeaderText,
  headerColor = PageColor.Primary,
  headerIcon,
  topListText,
  failedDelegationText,
  bottomListText,
  bottomText,
  confirmationButtonClick,
  confirmationButtonDisabled = false,
  confirmationButtonLoading = false,
  restartProcessPath,
  showNavigationButtons = true,
}: SummaryPageProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isSm = useMediaQuery('(max-width: 768px)');

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
          middleText={t('api_delegation.org_nr') + ' ' + org.orgNr}
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
          middleText={apiDelegation.apiName}
          leftText={apiDelegation.orgName}
        ></CompactDeletableListItem>
      );
    },
  );

  const del = successfulDelegations;
  const successfulDelegatedItems = del?.map(
    (apiDelegation: ApiDelegation, index: Key | null | undefined) => {
      return (
        <CompactDeletableListItem
          key={index}
          middleText={apiDelegation.apiName}
          leftText={apiDelegation.orgName}
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

  const navigateToOverview = () => {
    dispatch(setOveviewToReload());
    navigate('/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.Overview);
  };

  return (
    <Page
      color={headerColor}
      size={isSm ? PageSize.Small : PageSize.Medium}
    >
      <PageHeader icon={headerIcon}>{pageHeaderText}</PageHeader>
      <PageContent>
        <div className={common.pageContent}>
          {showErrorPanel() ? (
            <Panel
              title={t('common.error')}
              variant={PanelVariant.Error}
              forceMobileLayout={isSm}
              showIcon={!isSm}
            >
              <div>
                <p>{t('api_delegation.delegations_not_registered')}</p>
                <div className={classes.restartButton}>
                  <Button
                    variant={ButtonVariant.Outline}
                    color={ButtonColor.Danger}
                    onClick={() => {
                      navigate(restartProcessPath);
                    }}
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
              <h3 className={cn(classes.failedSectionText, classes.infoText)}>
                {failedDelegationText}
              </h3>
              {showBottomSection() && (
                <div>
                  <h2 className={classes.bottomListText}>{bottomListText}</h2>
                  {delegableOrgs !== undefined && (
                    <List borderStyle={'dashed'}>{delegableOrgListItems}</List>
                  )}
                  {successfulDelegations !== undefined && (
                    <List borderStyle={'dashed'}>{successfulDelegatedItems}</List>
                  )}
                </div>
              )}
              <h3 className={classes.infoText}>{bottomText}</h3>
              {showNavigationButtons ? (
                <NavigationButtons
                  previousPath={'/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.ChooseApi}
                  previousText={t('api_delegation.previous')}
                  nextPath={'/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.Receipt}
                  nextText={t('api_delegation.confirm_delegation')}
                  nextDisabled={confirmationButtonDisabled}
                  nextLoading={confirmationButtonLoading}
                  nextButtonColor={ButtonColor.Success}
                  nextButtonClick={confirmationButtonClick}
                ></NavigationButtons>
              ) : (
                <div className={classes.receiptMainButton}>
                  <Button
                    color={ButtonColor.Primary}
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Filled}
                    onClick={navigateToOverview}
                    fullWidth={isSm}
                  >
                    {t('api_delegation.receipt_page_main_button')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </PageContent>
    </Page>
  );
};

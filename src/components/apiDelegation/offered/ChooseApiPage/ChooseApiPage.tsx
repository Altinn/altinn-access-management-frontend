import type { MultiSelectOption } from '@digdir/design-system-react';
import { PanelVariant, Panel, SearchField } from '@altinn/altinn-design-system';
import { Select, List, Spinner } from '@digdir/design-system-react';
import type { Key } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as React from 'react';

import {
  Page,
  PageHeader,
  PageContent,
  PageSize,
  NavigationButtons,
  PageContainer,
} from '@/components/reusables';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ReactComponent as OfficeIcon } from '@/assets/Office1.svg';
import { RouterPath } from '@/routes/Router';
import { ReactComponent as ApiIcon } from '@/assets/Api.svg';
import { CompactDeletableListItem } from '@/components/reusables/CompactDeletableListItem';
import {
  NewDelegationAccordionButtonType,
  NewDelegationAccordion,
} from '@/components/reusables/NewDelegationAccordion';
import { useMediaQuery } from '@/resources/hooks';
import common from '@/resources/css/Common.module.css';
import { softRemoveOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import type { DelegableOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import {
  fetchDelegableApis,
  softAddApi,
  softRemoveApi,
  search,
  filter,
} from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import type { DelegableApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';

import classes from './ChooseApiPage.module.css';

export const ChooseApiPage = () => {
  const [searchString, setSearchString] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const delegableApis = useAppSelector((state) => state.delegableApi.presentedApiList);
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenDelegableApiList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const apiProviders = useAppSelector((state) => state.delegableApi.apiProviders);
  const loading = useAppSelector((state) => state.delegableApi.loading);
  const error = useAppSelector((state) => state.delegableApi.error);
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();
  const { t } = useTranslation('common');
  const fetchData = async () => await dispatch(fetchDelegableApis());

  useEffect(() => {
    if (loading) {
      void fetchData();
    }
    dispatch(filter([]));
    dispatch(search(''));
  }, []);

  function handleSearch(searchText: string) {
    setSearchString(searchText);
    dispatch(search(searchText));
  }

  const handleFilterChange = (filterList: string[]) => {
    setFilters(filterList);
    dispatch(filter(filterList));
    dispatch(search(searchString));
  };

  const handleRemove = (api: DelegableApi) => {
    dispatch(softRemoveApi(api));
    dispatch(filter(filters));
    dispatch(search(searchString));
  };

  const filterOptions: MultiSelectOption[] = apiProviders.map((provider: string) => ({
    label: provider,
    value: provider,
    deleteButtonLabel: t('api_delegation.delete') + ' ' + provider,
  }));

  const delegableApiAccordions = () => {
    if (error) {
      return (
        <Panel
          title={t('api_delegation.data_retrieval_failed')}
          variant={PanelVariant.Error}
          forceMobileLayout
        >
          <div>
            {t('common.error_status_code')}: {error}
          </div>
        </Panel>
      );
    } else if (loading) {
      return (
        <div className={common.spinnerContainer}>
          <Spinner
            title={String(t('common.loading'))}
            size='large'
          />
        </div>
      );
    }
    return delegableApis.map((api: DelegableApi, index: Key | null | undefined) => {
      return (
        <NewDelegationAccordion
          title={api.apiName}
          subtitle={api.orgName}
          key={index}
          topContentText={api.rightDescription}
          bottomContentText={api.description}
          textList={api.scopes}
          buttonType={NewDelegationAccordionButtonType.Add}
          addRemoveClick={() => dispatch(softAddApi(api))}
        ></NewDelegationAccordion>
      );
    });
  };

  const chosenApiAccordions = chosenApis.map((api: DelegableApi, index: Key | null | undefined) => {
    return (
      <NewDelegationAccordion
        title={api.apiName}
        subtitle={api.orgName}
        topContentText={api.rightDescription}
        bottomContentText={api.description}
        textList={api.scopes}
        key={index}
        buttonType={NewDelegationAccordionButtonType.Remove}
        addRemoveClick={() => {
          handleRemove(api);
        }}
      ></NewDelegationAccordion>
    );
  });

  const chosenDelegableOrgs = chosenOrgs.map((org: DelegableOrg, index: Key) => {
    return (
      <CompactDeletableListItem
        key={index}
        startIcon={<OfficeIcon />}
        removeCallback={chosenOrgs.length > 1 ? () => dispatch(softRemoveOrg(org)) : null}
        leftText={org.orgName}
        middleText={!isSm ? t('api_delegation.org_nr') + ' ' + org.orgNr : undefined}
      ></CompactDeletableListItem>
    );
  });

  return (
    <PageContainer>
      <Page size={isSm ? PageSize.Small : PageSize.Medium}>
        <PageHeader icon={<ApiIcon />}>{t('api_delegation.give_access_to_new_api')}</PageHeader>
        <PageContent>
          <div className={common.pageContent}>
            {chosenDelegableOrgs.length < 1 ? (
              <Panel
                title={t('common.error')}
                variant={PanelVariant.Warning}
                forceMobileLayout={isSm}
              >
                {t('api_delegation.orgs_not_chosen_subtitle')}
              </Panel>
            ) : (
              <div>
                <h3>{t('api_delegation.chosen_orgs')}:</h3>
                <List borderStyle={'dashed'}>{chosenDelegableOrgs}</List>
              </div>
            )}
            <h3>{t('api_delegation.new_api_content_text2')}</h3>
            {isSm && chosenApis.length > 0 && (
              <div className={common.apiAccordions}>
                <h4>{t('api_delegation.chosen_apis')}</h4>
                <div className={classes.accordionScrollContainer}>{chosenApiAccordions}</div>
              </div>
            )}
            <div className={classes.searchSection}>
              <SearchField
                value={searchString}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  handleSearch(event.target.value);
                }}
              ></SearchField>
              <div className={classes.filter}>
                <Select
                  label={String(t('api_delegation.filter_label'))}
                  deleteButtonLabel={String(t('api_delegation.filter_remove_all'))}
                  multiple={true}
                  onChange={handleFilterChange}
                  options={filterOptions}
                />
              </div>
            </div>
            <div className={classes.pageContentAccordionsContainer}>
              <div className={common.apiAccordions}>
                <h4>{t('api_delegation.delegable_apis')}:</h4>
                <div className={classes.accordionScrollContainer}>{delegableApiAccordions()}</div>
              </div>
              {!isSm && (
                <div className={common.apiAccordions}>
                  <h4>{t('api_delegation.chosen_apis')}</h4>
                  <div className={classes.accordionScrollContainer}>{chosenApiAccordions}</div>
                </div>
              )}
            </div>
            <NavigationButtons
              previousText={t('api_delegation.previous')}
              previousPath={'/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.ChooseOrg}
              nextText={t('api_delegation.next')}
              nextPath={'/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.Confirmation}
              nextDisabled={chosenApis.length < 1 || chosenOrgs.length < 1}
            ></NavigationButtons>
          </div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};

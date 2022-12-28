import type { MultiSelectOption } from '@altinn/altinn-design-system';
import {
  BorderStyle,
  Page,
  PageContent,
  PageHeader,
  SearchField,
  Select,
  Button,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  List,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import {
  fetchDelegableApis,
  softAddApi,
  softRemoveApi,
  search,
  filter,
} from '@/rtk/features/delegableApi/delegableApiSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { ReactComponent as OfficeIcon } from '@/assets/Office1.svg';
import { softRemoveOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';

import { ReactComponent as ApiIcon } from '../../assets/ShakeHands.svg';
import {
  NewDelegationAccordionButtonType,
  NewDelegationAccordion,
} from '../Reusables/NewDelegationAccordion';
import { CompactDeletableListItem } from '../Reusables/CompactDeletableListItem';

import classes from './NewApiDelegationPage.module.css';

export const NewApiDelegationsPage = () => {
  const delegableApis = useAppSelector((state) => state.delegableApi.presentedApiList);
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenDelegableApiList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const apiProviders = useAppSelector((state) => state.delegableApi.apiProviders);
  const loading = useAppSelector((state) => state.delegableApi.loading);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchString, setSearchString] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const { t } = useTranslation('common');
  const fetchData = async () => await dispatch(fetchDelegableApis());

  useEffect(() => {
    if (loading) {
      void fetchData();
    }
  }, [delegableApis.length]);

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

  const delegableApiAccordions = delegableApis.map(
    (api: DelegableApi, index: Key | null | undefined) => {
      return loading ? (
        'Loading...'
      ) : (
        <NewDelegationAccordion
          title={api.apiName}
          subtitle={api.orgName}
          key={index}
          topContentText={api.rightsDescription}
          bottomContentText={api.description}
          buttonType={NewDelegationAccordionButtonType.Add}
          addRemoveClick={() => dispatch(softAddApi(api))}
        ></NewDelegationAccordion>
      );
    },
  );

  const chosenApiAccordions = chosenApis.map((api: DelegableApi, index: Key | null | undefined) => {
    return (
      <NewDelegationAccordion
        title={api.apiName}
        subtitle={api.orgName}
        topContentText={api.rightsDescription}
        bottomContentText={api.description}
        key={index}
        buttonType={NewDelegationAccordionButtonType.Remove}
        addRemoveClick={() => handleRemove(api)}
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
        middleText={org.orgNr}
      ></CompactDeletableListItem>
    );
  });

  return (
    <div>
      <div className={classes.page}>
        <Page>
          <PageHeader icon={<ApiIcon />}>{t('api_delegation.give_access_to_new_api')}</PageHeader>
          <PageContent>
            <div className={classes.pageContent}>
              {chosenDelegableOrgs.length < 0 ? (
                <h4>{t('api_delegation.no_chosen_orgs')}</h4>
              ) : (
                <div>
                  <h3>{t('api_delegation.chosen_orgs')}:</h3>
                  <List borderStyle={BorderStyle.Dashed}>{chosenDelegableOrgs}</List>
                </div>
              )}
              <h3>{t('api_delegation.new_api_content_text2')}</h3>
              <div className={classes.searchSection}>
                <SearchField
                  value={searchString}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleSearch(event.target.value)
                  }
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
                <div className={classes.apiAccordions}>
                  <h4>{t('api_delegation.delegable_apis')}:</h4>
                  <div className={classes.accordionScrollContainer}>{delegableApiAccordions}</div>
                </div>
                <div className={classes.apiAccordions}>
                  <h4>{t('api_delegation.chosen_apis')}</h4>
                  <div className={classes.accordionScrollContainer}>{chosenApiAccordions}</div>
                </div>
              </div>
              <div className={classes.navButtonContainer}>
                <div className={classes.navButton}>
                  <Button
                    color={ButtonColor.Primary}
                    variant={ButtonVariant.Outline}
                    size={ButtonSize.Small}
                    fullWidth={true}
                    onClick={() => navigate('/api-delegations/new-org-delegation')}
                  >
                    {t('api_delegation.previous')}
                  </Button>
                </div>
                <div className={classes.navButton}>
                  <Button
                    color={ButtonColor.Primary}
                    variant={ButtonVariant.Filled}
                    size={ButtonSize.Small}
                    fullWidth={true}
                    onClick={() => navigate('/api-delegations/confirmation')}
                    disabled={chosenApis.length < 1 || chosenOrgs.length < 1}
                  >
                    {t('api_delegation.next')}
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

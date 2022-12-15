import type { MultiSelectOption } from '@altinn/altinn-design-system';
import {
  Page,
  PageContent,
  PageHeader,
  SearchField,
  Select,
  Button,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softAdd, softRemove, search, filter } from '@/rtk/features/delegableApi/delegableApiSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';

import { ReactComponent as ApiIcon } from '../../assets/ShakeHands.svg';
import {
  NewDelegationAccordionButtonType,
  NewDelegationAccordion,
} from '../Reusables/NewDelegationAccordion';

import classes from './NewApiDelegationPage.module.css';

export const NewApiDelegationsPage = () => {
  const delegableApis = useAppSelector((state) => state.delegableApi.presentedApiList);
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenDelegableApiList);
  const apiProviders = useAppSelector((state) => state.delegableApi.apiProviders);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchString, setSearchString] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const { t } = useTranslation('common');

  const handleSearch = (searchText: string) => {
    setSearchString(searchText);
    dispatch(search(searchText));
  };

  const handleFilterChange = (filterList: string[]) => {
    setFilters(filterList);
    dispatch(filter(filterList));
    dispatch(search(searchString));
  };

  const handleRemove = (api: DelegableApi) => {
    dispatch(softRemove(api));
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
      return (
        <NewDelegationAccordion
          title={api.apiName}
          subtitle={api.orgName}
          description={api.description}
          key={index}
          buttonType={NewDelegationAccordionButtonType.Add}
          addRemoveClick={() => dispatch(softAdd(api))}
        ></NewDelegationAccordion>
      );
    },
  );

  const chosenApiAccordions = chosenApis.map((api: DelegableApi, index: Key | null | undefined) => {
    return (
      <NewDelegationAccordion
        title={api.apiName}
        subtitle={api.orgName}
        description={api.description}
        key={index}
        buttonType={NewDelegationAccordionButtonType.Remove}
        addRemoveClick={() => handleRemove(api)}
      ></NewDelegationAccordion>
    );
  });

  return (
    <div>
      <div className={classes.page}>
        <Page>
          <PageHeader icon={<ApiIcon />}>{t('api_delegation.give_access_to_new_api')}</PageHeader>
          <PageContent>
            <div className={classes.pageContent}>
              <h2>Gi tilgang til API</h2>
              <h3>Velg hvilke API du vil gi tilgang til ved å klikke på pluss-tegnet.</h3>
              <div className={classes.searchSection}>
                <SearchField
                  value={searchString}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleSearch(event.target.value)
                  }
                ></SearchField>
                <div className={classes.filter}>
                  <Select
                    label={t('api_delegation.filter_label')}
                    deleteButtonLabel={t('api_delegation.filter_remove_all')}
                    multiple={true}
                    onChange={handleFilterChange}
                    options={filterOptions}
                  />
                </div>
              </div>
              <div className={classes.pageContentAccordionsContainer}>
                <div className={classes.apiAccordions}>
                  <h4>Delegerbare API:</h4>
                  <div className={classes.accordionScrollContainer}>{delegableApiAccordions}</div>
                </div>
                <div className={classes.apiAccordions}>
                  <h4>Valgte API:</h4>
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
                    onClick={() => navigate('/api-delegations/new-org')}
                  >
                    Forrige
                  </Button>
                </div>
                <div className={classes.navButton}>
                  <Button
                    color={ButtonColor.Primary}
                    variant={ButtonVariant.Filled}
                    size={ButtonSize.Small}
                    fullWidth={true}
                    onClick={() => navigate('/api-delegations/confirmation')}
                  >
                    Neste
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

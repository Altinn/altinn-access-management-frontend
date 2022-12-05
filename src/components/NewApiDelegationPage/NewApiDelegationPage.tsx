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

import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softAdd, softRemove, search } from '@/rtk/features/delegableApi/delegableApiSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';

import { ReactComponent as ApiIcon } from '../../assets/ShakeHands.svg';

import { NewApiDelegationAccordion, AccordionButtonType } from './NewApiDelegationAccordion';
import classes from './NewApiDelegationPage.module.css';

export const NewApiDelegationsPage = () => {
  const delegableApis = useAppSelector((state) => state.delegableApi.presentedApiList);
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenDelegableApiList);
  const dispatch = useAppDispatch();
  const [searchString, setSearchString] = useState('');
  const [filters, setFilter] = useState<string[]>([]);

  const handleSearch = (searchText: string) => {
    setSearchString(searchText);
    dispatch(search([searchText, filters]));
  };

  const handleFilterChange = (e: string[]) => {
    setFilter(e);
    dispatch(search([searchString, e]));
  };

  const filterOptions: MultiSelectOption[] = [
    { label: 'Skatteetaten', value: 'Skatteetaten', deleteButtonLabel: 'Slett' },
    { label: 'CakeBoss', value: 'CakeBoss', deleteButtonLabel: 'Slett' },
    { label: 'Isbil', value: 'Isbil', deleteButtonLabel: 'Slett' },
    { label: 'Bama', value: 'Bama', deleteButtonLabel: 'Slett' },
  ];

  const delegableApiAccordions = delegableApis.map(
    (api: DelegableApi, index: Key | null | undefined) => {
      return (
        <NewApiDelegationAccordion
          delegableApi={api}
          key={index}
          buttonType={AccordionButtonType.Add}
          softAddCallback={() => dispatch(softAdd(api))}
        ></NewApiDelegationAccordion>
      );
    },
  );

  const chosenApiAccordions = chosenApis.map((api: DelegableApi, index: Key | null | undefined) => {
    return (
      <NewApiDelegationAccordion
        delegableApi={api}
        key={index}
        buttonType={AccordionButtonType.Remove}
        softRemoveCallback={() => dispatch(softRemove(api))}
      ></NewApiDelegationAccordion>
    );
  });

  return (
    <div>
      <div className={classes.pageContainer}>
        <Page>
          <PageHeader icon={<ApiIcon />}>Deleger nye APIer</PageHeader>
          <PageContent>
            <div className={classes.pageContent}>
              <h2>Gi tilgang til API</h2>
              <h3>Velg hvilke API du vil gi tilgang til ved å klikke på pluss-tegnet.</h3>
              <div className={classes.searchField}>
                <SearchField
                  value={searchString}
                  onChange={(e: any) => handleSearch(e.target.value)}
                ></SearchField>
                <Select
                  label='Filtrer basert på utsteder'
                  deleteButtonLabel='Fjern alle'
                  multiple={true}
                  onChange={handleFilterChange}
                  options={filterOptions}
                />
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

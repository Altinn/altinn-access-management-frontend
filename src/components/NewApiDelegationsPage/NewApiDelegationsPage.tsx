import { Page, PageContent, PageHeader, SearchField } from '@altinn/altinn-design-system';
import { useState } from 'react';

import { search } from '@/rtk/features/delegableOrgApi/delegableOrgApiSlice';

import { ReactComponent as ApiIcon } from '../../assets/api.svg';
import { useAppDispatch, useAppSelector } from '../../rtk/app/hooks';

import { AccordionButtonType } from './NewApiDelegationsAccordion/NewApiDelegationsAccordion';
import { NewApiDelegationsAccordion } from './NewApiDelegationsAccordion';
import classes from './NewApiDelegationsPage.module.css';

export const NewApiDelegationsPage = () => {
  const delegableOrgApis = useAppSelector((state) => state.delegableOrgApi.delegableOrgApiList);
  const chosenOrgApis = useAppSelector((state) => state.delegableOrgApi.chosenDelegableOrgApiList);
  const [searchString, setSearchString] = useState('');
  const dispatch = useAppDispatch();

  const handleSearch = (searchText: string) => {
    setSearchString(searchText);
    dispatch(search(searchText));
  };

  const delegableApiAccordions = delegableOrgApis.map((api, index) => {
    return (
      <NewApiDelegationsAccordion
        delegableApi={api}
        key={index}
        buttonType={AccordionButtonType.Add}
      ></NewApiDelegationsAccordion>
    );
  });

  const chosenApiAccordions = chosenOrgApis.map((api, index) => {
    return (
      <NewApiDelegationsAccordion
        delegableApi={api}
        key={index}
        buttonType={AccordionButtonType.Remove}
      ></NewApiDelegationsAccordion>
    );
  });

  return (
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
                onChange={(e) => handleSearch(e.target.value)}
              ></SearchField>
            </div>
            <div className={classes.pageContentAccordionsContainer}>
              <div className={classes.apiAccordions}>
                <h4>Delegerbare API:</h4>
                {delegableApiAccordions}
              </div>
              <div className={classes.apiAccordions}>
                <h4>Valgte API:</h4>
                {chosenApiAccordions}
              </div>
            </div>
          </div>
        </PageContent>
      </Page>
    </div>
  );
};

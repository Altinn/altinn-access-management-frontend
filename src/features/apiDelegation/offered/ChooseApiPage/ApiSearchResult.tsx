import { Spinner } from '@digdir/designsystemet-react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import common from '@/resources/css/Common.module.css';
import type { DelegableApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import { ErrorPanel } from '@/components';

import { ApiActionBar } from '../../components/ApiActionBar';

interface ApiSearchResultsProps {
  error?: FetchBaseQueryError | SerializedError;
  isFetching: boolean;
  urlParams: URLSearchParams;
  searchResults: DelegableApi[];
  chosenApis: DelegableApi[];
  addApi: (api: DelegableApi) => void;
}

export const ApiSearchResults = ({
  error,
  isFetching,
  urlParams,
  searchResults,
  chosenApis,
  addApi,
}: ApiSearchResultsProps) => {
  const { t } = useTranslation('common');

  const { statusMessage, unchosenApis } = useMemo(() => {
    const unchosenApis = searchResults?.filter(
      (searchResultApi) => !chosenApis.some((api) => api.identifier === searchResultApi.identifier),
    );
    const statusMessage =
      (!isFetching && !error && unchosenApis?.length) === 0
        ? t('api_delegation.search_for_api_no_result')
        : '';

    return { unchosenApis, statusMessage };
  }, [searchResults, error, isFetching, chosenApis]);

  const delegableApiActionBars = () => {
    if (isFetching) {
      return (
        <div className={common.spinnerContainer}>
          <Spinner
            title={t('common.loading')}
            variant='interaction'
          />
        </div>
      );
    }

    const prechosenApis = Array.from(urlParams.keys());

    return (
      <ul className={common.unstyledList}>
        {unchosenApis?.map((api: DelegableApi, index) => {
          const initWithDelegationCheck = prechosenApis.includes(api.identifier);
          return (
            <li key={`${api.identifier}${index}`}>
              <ApiActionBar
                variant={'add'}
                color={'neutral'}
                api={api}
                initWithDelegationCheck={initWithDelegationCheck}
                onAdd={() => {
                  addApi(api);
                }}
              />
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <StatusMessageForScreenReader visible>{statusMessage}</StatusMessageForScreenReader>

      {error?.message ? (
        <ErrorPanel
          role='alert'
          title={t('api_delegation.data_retrieval_failed')}
          message={error?.message}
          statusCode={error?.statusCode}
        ></ErrorPanel>
      ) : (
        delegableApiActionBars()
      )}
    </>
  );
};

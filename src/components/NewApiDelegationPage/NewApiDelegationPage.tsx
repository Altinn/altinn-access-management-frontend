import {
  Page,
  PageContent,
  PageHeader,
  SearchField,
  Button,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softAdd, softRemove } from '@/rtk/features/delegableApi/delegableApiSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';

import { ReactComponent as ApiIcon } from '../../assets/ShakeHands.svg';
import {
  NewDelegationAccordionButtonType,
  NewDelegationAccordion,
} from '../Common/NewDelegationAccordion';

import classes from './NewApiDelegationPage.module.css';

export const NewApiDelegationsPage = () => {
  const delegableApis = useAppSelector((state) => state.delegableApi.delegableApiList);
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenDelegableApiList);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

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
        addRemoveClick={() => dispatch(softRemove(api))}
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
              <div className={classes.searchField}>
                <SearchField></SearchField>
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

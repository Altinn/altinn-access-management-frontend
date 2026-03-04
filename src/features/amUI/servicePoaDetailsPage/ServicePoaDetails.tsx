import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { FilesIcon } from '@navikt/aksel-icons';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  ServiceResource,
  useGetSingleRightsQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { amUIPath } from '@/routes/paths';

import classes from './ServicePoaDetailsPage.module.css';
import { ServiceUsersTab } from './ServiceUsersTab';

export const ServicePoaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { fromParty, actingParty } = usePartyRepresentation();
  const location = useLocation();
  const selectedResourceFromState = (location.state as { resource?: ServiceResource } | null)
    ?.resource;

  const serviceIdentifier = decodeURIComponent(id ?? '');

  const {
    data: delegatedResources,
    isLoading,
    isFetching,
    error,
  } = useGetSingleRightsQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid || !serviceIdentifier,
    },
  );

  const serviceDelegations = useMemo(
    () =>
      delegatedResources?.filter(
        (delegation) => delegation.resource?.identifier === serviceIdentifier,
      ) ?? [],
    [delegatedResources, serviceIdentifier],
  );

  const service =
    serviceDelegations[0]?.resource ??
    (selectedResourceFromState?.identifier === serviceIdentifier
      ? selectedResourceFromState
      : null);
  const permissions = useMemo(
    () => serviceDelegations.flatMap((delegation) => delegation.permissions ?? []),
    [serviceDelegations],
  );

  if (error) {
    return (
      <DsAlert data-color='danger'>
        {t('service_poa_details_page.load_error')}{' '}
        <Link to={`/${amUIPath.PoaOverview}#singleRights`}>
          {t('service_poa_details_page.back_to_overview_link')}
        </Link>
      </DsAlert>
    );
  }

  if (!isLoading && !service) {
    return (
      <DsAlert data-color='warning'>
        {t('service_poa_details_page.not_found')}{' '}
        <Link to={`/${amUIPath.PoaOverview}#singleRights`}>
          {t('service_poa_details_page.back_to_overview_link')}
        </Link>
      </DsAlert>
    );
  }

  return (
    <>
      <div className={classes.headingContainer}>
        <FilesIcon
          className={classes.serviceIcon}
          aria-hidden={true}
        />
        <DsHeading
          level={1}
          data-size='lg'
          className={classes.pageHeading}
        >
          {service?.title ?? serviceIdentifier}
        </DsHeading>
        {service?.description && (
          <DsParagraph
            variant='long'
            className={classes.pageDescription}
          >
            {service.description}
          </DsParagraph>
        )}
      </div>
      <ServiceUsersTab
        resource={service}
        permissions={permissions}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    </>
  );
};

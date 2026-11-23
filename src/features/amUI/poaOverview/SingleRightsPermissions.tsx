import { useCallback, useMemo, type ElementType } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import {
  useGetSingleRightsForRightholderQuery,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import { amUIPath } from '@/routes/paths/amUIPath';
import { usePermissionOverview } from '@/resources/hooks';

import { PermissionsBadge } from '../common/PermissionsBadge/PermissionsBadge';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ServiceSearchLists } from '../common/ServiceSearchLists/ServiceSearchLists';

export const SingleRightsPermissions = () => {
  const { t } = useTranslation();
  const { actingParty, fromParty, isLoading: isPartyLoading } = usePartyRepresentation();

  // Both lists link to the service's own details page.
  const getResourceItemAs = useCallback(
    (resource: ServiceResource): ElementType =>
      (props) => (
        <Link
          {...props}
          to={`/${amUIPath.PoaOverview}/service/${encodeURIComponent(resource.identifier)}`}
        />
      ),
    [],
  );

  // No `to` is passed: the overview lists services delegated from the reportee to anyone.
  const {
    data: delegations,
    isLoading: isLoadingDelegations,
    isError,
  } = useGetSingleRightsForRightholderQuery(
    {
      actingParty: actingParty?.id || '',
      from: fromParty?.id || '',
    },
    {
      skip: !actingParty?.id || !fromParty?.id,
    },
  );

  const permissionsByResource = useMemo(
    () => new Map((delegations ?? []).map((d) => [d.resource?.identifier, d.permissions])),
    [delegations],
  );

  if (isError) {
    return (
      <DsAlert
        role='alert'
        data-color='danger'
      >
        <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
      </DsAlert>
    );
  }

  return (
    <>
      <DsParagraph>{t('poa_overview_page.services_tab.description')}</DsParagraph>
      <ServiceSearchLists
        delegations={delegations}
        isLoading={isLoadingDelegations || isPartyLoading}
        assignedList={{
          getItemAs: getResourceItemAs,
          renderControls: (resource) => {
            const permissions = permissionsByResource.get(resource.identifier);
            return permissions?.length ? (
              <SingleRightsPermissionBadge permissions={permissions} />
            ) : null;
          },
        }}
        otherList={{ getItemAs: getResourceItemAs }}
      />
    </>
  );
};

interface SingleRightsPermissionBadgeProps {
  permissions: Permissions[];
}

const SingleRightsPermissionBadge = ({ permissions }: SingleRightsPermissionBadgeProps) => {
  const { permissionsOverview } = usePermissionOverview({
    permissions: permissions ?? [],
  });
  return <PermissionsBadge permissions={permissionsOverview} />;
};

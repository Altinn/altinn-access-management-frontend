import { useCallback, type ElementType } from 'react';
import { Link } from 'react-router';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { InstanceList } from '../common/InstanceList/InstanceList';
import { InstanceDelegation, useGetInstancesQuery } from '@/rtk/features/instanceApi';

export const InstancePermissions = () => {
  const { t, i18n } = useTranslation();
  const { actingParty, fromParty, toParty } = usePartyRepresentation();
  const getItemAs = useCallback(
    (item: InstanceDelegation): ElementType =>
      (props) => (
        <Link
          {...props}
          to={`/poa-overview/instance?instanceUrn=${encodeURIComponent(item.instance.refId)}&resourceId=${encodeURIComponent(item.resource.identifier)}&tab=instances`}
        />
      ),
    [],
  );

  const {
    data: instances = [],
    isLoading,
    isError,
  } = useGetInstancesQuery(
    {
      party: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid,
      to: toParty?.partyUuid,
      language: i18n.language,
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid,
    },
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
    <InstanceList
      instances={instances}
      isLoading={isLoading}
      getItemAs={getItemAs}
      interactive
    />
  );
};

import { useCallback, type ElementType } from 'react';
import { Link } from 'react-router';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { type InstanceDelegation, useGetInstancesQuery } from '@/rtk/features/instanceApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { InstanceList } from '../common/InstanceList/InstanceList';

export const InstancePermissions = () => {
  const { t, i18n } = useTranslation();
  const { actingParty, fromParty, toParty } = usePartyRepresentation();
  const getItemAs = useCallback(
    (item: InstanceDelegation): ElementType =>
      (props) => (
        <Link
          {...props}
          to={`/poa-overview/instance?instanceUrn=${encodeURIComponent(item.instance.refId)}&resourceId=${encodeURIComponent(item.resource.identifier)}`}
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
      party: actingParty?.id || '',
      from: fromParty?.id,
      to: toParty?.id,
      language: i18n.language,
    },
    {
      skip: !actingParty?.id || !fromParty?.id,
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

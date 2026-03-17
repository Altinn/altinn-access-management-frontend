import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';

import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { InstanceList } from '@/features/amUI/common/InstanceList/InstanceList';
import { useGetInstancesQuery } from '@/rtk/features/instanceApi';

import classes from './InstanceSection.module.css';

export const InstanceSection = () => {
  const { t } = useTranslation();
  const { toParty, actingParty, fromParty } = usePartyRepresentation();

  const {
    data: instances = [],
    isLoading,
    isError,
  } = useGetInstancesQuery(
    {
      party: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid,
      to: toParty?.partyUuid,
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid || !toParty?.partyUuid,
    },
  );

  return (
    <div className={classes.instanceSectionContainer}>
      <DsHeading
        level={2}
        data-size='xs'
      >
        {t('user_rights_page.instances_title')}
      </DsHeading>
      {isError && (
        <DsAlert
          role='alert'
          data-color='danger'
        >
          <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
        </DsAlert>
      )}
      {!isError && (
        <InstanceList
          instances={instances}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

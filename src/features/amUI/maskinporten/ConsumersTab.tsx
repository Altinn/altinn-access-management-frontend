import { useTranslation } from 'react-i18next';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';

import { useGetMaskinportenConsumersQuery } from '@/rtk/features/maskinportenApi';

import { MaskinportenUserSearch } from './MaskinportenUserSearch';
import classes from './MaskinportenPage.module.css';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { MaskinportenInfoPopover } from './MaskinportenInfoPopover';

type ConsumersTabProps = {
  party: string;
  isActive: boolean;
  canFetch: boolean;
};

export const ConsumersTab = ({ party, isActive, canFetch }: ConsumersTabProps) => {
  const { t } = useTranslation();
  const {
    data: consumers,
    isLoading,
    error,
  } = useGetMaskinportenConsumersQuery({ party }, { skip: !isActive || !canFetch || !party });
  const { actingParty } = usePartyRepresentation();

  return (
    <div className={classes.panelContent}>
      <div className={classes.description}>
        <DsParagraph>
          {t('maskinporten_page.consumers_description', {
            name: formatDisplayName({ fullName: actingParty?.name ?? '', type: 'company' }) ?? '',
          })}
        </DsParagraph>
        <MaskinportenInfoPopover
          triggerAriaLabel={t('maskinporten_page.consumers_info_icon_label')}
          paragraph1={t('maskinporten_page.consumers_info_body')}
        />
      </div>
      <MaskinportenUserSearch
        connections={consumers}
        isLoading={isLoading}
        error={error}
        emptyText={t('maskinporten_page.no_consumers')}
        canDelegate={false}
        getUserLink={(user) => {
          const orgNr = consumers?.find((c) => c.party.id === user.id)?.party
            .organizationIdentifier;
          return orgNr ? `/maskinporten/consumer/${orgNr}` : '';
        }}
      />
    </div>
  );
};

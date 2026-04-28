import { useTranslation } from 'react-i18next';

import { useGetMaskinportenConsumersQuery } from '@/rtk/features/maskinportenApi';

import { MaskinportenUserSearch } from './MaskinportenUserSearch';
import classes from './MaskinportenPage.module.css';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';

type MaskinportenConsumersTabProps = {
  party: string;
  isActive: boolean;
  canFetch: boolean;
};

export const MaskinportenConsumersTab = ({
  party,
  isActive,
  canFetch,
}: MaskinportenConsumersTabProps) => {
  const { t } = useTranslation();
  const {
    data: consumers,
    isLoading,
    error,
  } = useGetMaskinportenConsumersQuery({ party }, { skip: !isActive || !canFetch || !party });
  const { actingParty } = usePartyRepresentation();
  return (
    <div className={classes.panelContent}>
      <DsParagraph>
        {t('maskinporten_page.consumers_description', {
          name: formatDisplayName({ fullName: actingParty?.name ?? '', type: 'company' }) ?? '',
        })}
      </DsParagraph>
      <MaskinportenUserSearch
        connections={consumers}
        isLoading={isLoading}
        error={error}
        emptyText={t('maskinporten_page.no_consumers')}
      />
    </div>
  );
};

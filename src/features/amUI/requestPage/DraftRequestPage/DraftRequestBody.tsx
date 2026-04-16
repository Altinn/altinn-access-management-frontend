import { EnrichedRequestDto } from '@/rtk/features/requestApi';
import { useTranslation } from 'react-i18next';
import { DsParagraph } from '@altinn/altinn-components';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { useRightsSection } from '../../common/DelegationModal/SingleRights/hooks/useRightsSection';
import { ResourceHeading } from '../../common/DelegationModal/SingleRights/ResourceHeading';
import { RightsSection } from '../../common/DelegationModal/SingleRights/RightsSection';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import classes from './DraftRequestPage.module.css';

interface DraftRequestBodyProps {
  request: EnrichedRequestDto;
  fromName: string;
}

export const DraftRequestBody = ({ request, fromName }: DraftRequestBodyProps) => {
  const { t } = useTranslation();
  const { selfParty } = usePartyRepresentation();

  const { rights, setRights } = useRightsSection({ resource: request.resource, isRequest: true });

  const isSelfParty = selfParty?.partyUuid === request?.from.id;

  return (
    <div>
      <div
        className={classes.resourceInfo}
        data-size='sm'
      >
        <ResourceHeading resource={request.resource} />
      </div>
      {request.resource.description && (
        <DsParagraph className={classes.resourceInfo}>{request.resource.description}</DsParagraph>
      )}
      {request.resource.rightDescription && (
        <DsParagraph className={classes.resourceInfo}>
          {request.resource.rightDescription}
        </DsParagraph>
      )}
      <RightsSection
        rights={rights}
        setRights={setRights}
        undelegableActions={[]}
        isDelegationCheckLoading={false}
        toName={isSelfParty ? t('common.you_uppercase') : fromName}
        availableActions={[DelegationAction.REQUEST]}
        delegationError={null}
        missingAccess={null}
      />
    </div>
  );
};

import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  formatDisplayName,
} from '@altinn/altinn-components';
import cn from 'classnames';
import {
  EnrichedRequestDto,
  useConfirmRequestMutation,
  useWithdrawRequestMutation,
} from '@/rtk/features/requestApi';
import classes from './DraftRequestPage.module.css';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { ResourceHeading } from '../../common/DelegationModal/SingleRights/ResourceHeading';
import { RightsSection } from '../../common/DelegationModal/SingleRights/RightsSection';
import { useSingleRightsDelegationRightsData } from '../../common/DelegationModal/SingleRights/hooks/useSingleRightsDelegationRightsData';
import { DelegationAction } from '../../common/DelegationModal/EditModal';

interface DraftRequestPageContentProps {
  request: EnrichedRequestDto;
}

export const DraftRequestPageContent = ({ request }: DraftRequestPageContentProps) => {
  const { t } = useTranslation();

  const { selfParty } = usePartyRepresentation();
  const toName = formatDisplayName({
    fullName: request.to.name,
    type: request.to.type === 'Person' ? 'person' : 'company',
  });
  const fromName = formatDisplayName({
    fullName: request.from.name,
    type: request.from.type === 'Person' ? 'person' : 'company',
  });

  const [
    confirmRequest,
    { data: confirmResponse, error: confirmRequestError, isLoading: isConfirmingRequest },
  ] = useConfirmRequestMutation();

  const [
    withdrawRequest,
    { data: withdrawResponse, error: withdrawRequestError, isLoading: isWithdrawingRequest },
  ] = useWithdrawRequestMutation();

  const { rights, setRights } = useSingleRightsDelegationRightsData({
    resource: request.resource,
    isRequest: true,
  });

  const onConfirmRequest = () => {
    if (!isActionButtonDisabled) {
      confirmRequest({ party: request.from.id, id: request.id });
    }
  };

  const onWithdrawRequest = () => {
    if (!isActionButtonDisabled) {
      withdrawRequest({ party: request.from.id, id: request.id });
    }
  };
  const isSelfParty = selfParty?.partyUuid === request.from.id;
  const isActionButtonDisabled = isConfirmingRequest || isWithdrawingRequest;

  if (confirmResponse) {
    return (
      <RequestReceipt
        headerTextKey='draft_request_page.request_approved'
        bodyTextKey='draft_request_page.request_approved_info'
        toName={toName}
      />
    );
  }

  if (withdrawResponse) {
    return (
      <RequestReceipt
        headerTextKey='draft_request_page.request_withdrawn'
        bodyTextKey='draft_request_page.request_withdrawn_info'
        toName={toName}
      />
    );
  }

  return (
    <div className={classes.centerBlock}>
      <div className={cn(classes.requestBlock, classes.headerBlock)}>
        <DsHeading
          level={1}
          data-size='md'
        >
          <Trans
            i18nKey={'draft_request_page.heading'}
            components={{ b: <strong /> }}
            values={{ to_name: toName }}
          />
        </DsHeading>
        <DsParagraph>
          <Trans
            i18nKey={
              isSelfParty ? 'draft_request_page.intro_person' : 'draft_request_page.intro_company'
            }
            components={{ b: <strong /> }}
            values={{ to_name: toName, from_name: fromName }}
          />
        </DsParagraph>
      </div>
      <div className={classes.requestBlock}>
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
        {confirmRequestError && (
          <DsAlert data-color='danger'>{t('draft_request_page.approve_request_error')}</DsAlert>
        )}
        {withdrawRequestError && (
          <DsAlert data-color='danger'>{t('draft_request_page.withdraw_request_error')}</DsAlert>
        )}
        <div className={classes.buttonRow}>
          <DsButton
            variant='primary'
            aria-disabled={isActionButtonDisabled}
            loading={isConfirmingRequest}
            onClick={onConfirmRequest}
          >
            {t('draft_request_page.confirm_request')}
          </DsButton>
          <DsButton
            variant='primary'
            aria-disabled={isActionButtonDisabled}
            loading={isWithdrawingRequest}
            onClick={onWithdrawRequest}
          >
            {t('draft_request_page.withdraw_request')}
          </DsButton>
        </div>
      </div>
    </div>
  );
};

interface RequestReceiptProps {
  headerTextKey: string;
  bodyTextKey: string;
  toName: string;
}

const RequestReceipt = ({ headerTextKey, bodyTextKey, toName }: RequestReceiptProps) => {
  const { t } = useTranslation();

  return (
    <div className={classes.centerBlock}>
      <div className={cn(classes.requestBlock, classes.headerBlock)}>
        <DsHeading
          level={1}
          data-size='md'
        >
          <Trans
            i18nKey={headerTextKey}
            components={{ b: <strong /> }}
            values={{ to_name: toName }}
          />
        </DsHeading>
      </div>
      <div className={classes.requestBlock}>
        <DsParagraph>
          <Trans
            i18nKey={bodyTextKey}
            components={{ b: <strong /> }}
            values={{ to_name: toName }}
          />
        </DsParagraph>
        <DsParagraph className={classes.closeWindowInfo}>
          {t('draft_request_page.close_window_info')}
        </DsParagraph>
      </div>
    </div>
  );
};

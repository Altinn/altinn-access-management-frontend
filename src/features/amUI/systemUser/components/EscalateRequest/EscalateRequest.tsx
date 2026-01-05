import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  DsValidationMessage,
} from '@altinn/altinn-components';
import React, { useState } from 'react';
import { ButtonRow } from '../ButtonRow/ButtonRow';
import { getApiBaseUrl } from '../../urlUtils';
import classes from './EscalateRequest.module.css';
import {
  useEscalateAgentRequestMutation,
  useEscalateRequestMutation,
} from '@/rtk/features/systemUserApi';
import { useTranslation } from 'react-i18next';
import { getLogoutUrl } from '@/resources/utils/pathUtils';
import { SystemUserRequest } from '../../types';

interface EscalateRequestProps {
  request: SystemUserRequest;
  isAgentRequest?: boolean;
}

export const EscalateRequest = ({ request, isAgentRequest }: EscalateRequestProps) => {
  const { t } = useTranslation();
  const [isStepTwo, setIsStepTwo] = useState<boolean>(false);

  const [postEscalateRequest, { isError: escalateRequestError, isLoading: isEscalatingRequest }] =
    useEscalateRequestMutation();

  const [
    postEscalateAgentRequest,
    { isError: escalateAgentRequestError, isLoading: isEscalatingAgentRequest },
  ] = useEscalateAgentRequestMutation();

  const redirectAndLogout = (): void => {
    const url = request.redirectUrl
      ? `${getApiBaseUrl()}/request/${request.id}/logout`
      : getLogoutUrl();
    window.location.assign(url);
  };

  const onEscalate = (): void => {
    const promise = isAgentRequest ? postEscalateAgentRequest : postEscalateRequest;
    promise({ partyId: request.partyId, requestId: request.id })
      .unwrap()
      .then(() => setIsStepTwo(true));
  };

  if (request.escalated) {
    return (
      <DsAlert data-color='info'>{t('systemuser_request.escalate_already_escalated')}</DsAlert>
    );
  }

  return (
    <DsAlert
      data-color='warning'
      className={classes.escalateAlert}
    >
      {isStepTwo ? (
        <StepTwo onCancel={redirectAndLogout} />
      ) : (
        <StepOne
          isLoading={isEscalatingRequest || isEscalatingAgentRequest}
          isError={escalateRequestError || escalateAgentRequestError}
          onEscalate={onEscalate}
          onCancel={redirectAndLogout}
        />
      )}
    </DsAlert>
  );
};

interface StepOneProps {
  isLoading: boolean;
  isError: boolean;
  onEscalate: () => void;
  onCancel: () => void;
}
const StepOne = ({ isLoading, isError, onEscalate, onCancel }: StepOneProps) => {
  const { t } = useTranslation();
  return (
    <>
      <DsHeading
        data-size='2xs'
        level={3}
      >
        {t('systemuser_request.escalate_title')}
      </DsHeading>
      <div>
        <DsParagraph>{t('systemuser_request.escalate_description')}</DsParagraph>
        <ButtonRow smallMarginTop>
          <DsButton
            data-color='info'
            variant='primary'
            loading={isLoading}
            onClick={onEscalate}
          >
            {t('systemuser_request.escalate_confirm_button')}
          </DsButton>
          <DsButton
            variant='tertiary'
            onClick={onCancel}
          >
            {t('systemuser_request.escalate_cancel_button')}
          </DsButton>
          {isError && (
            <DsValidationMessage>{t('systemuser_request.escalate_error')}</DsValidationMessage>
          )}
        </ButtonRow>
      </div>
    </>
  );
};

interface StepTwoProps {
  onCancel: () => void;
}
const StepTwo = ({ onCancel }: StepTwoProps) => {
  const { t } = useTranslation();
  return (
    <>
      <DsHeading
        data-size='xs'
        level={3}
      >
        {t('systemuser_request.escalate_sent_title')}
      </DsHeading>
      <div>
        <DsParagraph>{t('systemuser_request.escalate_sent_description')}</DsParagraph>
        <ButtonRow smallMarginTop>
          <DsButton
            data-color='info'
            variant='primary'
            onClick={onCancel}
          >
            {t('systemuser_request.escalate_close_button')}
          </DsButton>
        </ButtonRow>
      </div>
    </>
  );
};

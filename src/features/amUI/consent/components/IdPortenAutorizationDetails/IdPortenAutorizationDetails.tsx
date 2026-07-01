import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  IdPortenAuthorization,
  useWithdrawIdPortenAuthorizationMutation,
} from '@/rtk/features/idPortenAuthorizationApi';
import { DsAlert, DsDetails, DsHeading } from '@altinn/altinn-components';
import { ConsentRights } from '../ConsentRights/ConsentRights';
import { parseUserAgent, toDateTimeString } from '../../utils';
import { ConsentStatus } from '../ConsentStatus/ConsentStatus';
import { RevokeConsentPopover } from '../RevokeConsentPopover/RevokeConsentPopover';
import classes from './IdPortenAutorizationDetails.module.css';

interface IdPortenAutorizationDetailsProps {
  idPortenAuthorization: IdPortenAuthorization;
}

export const IdPortenAutorizationDetails = ({
  idPortenAuthorization,
}: IdPortenAutorizationDetailsProps) => {
  const { t } = useTranslation();

  const [withdrawIdPortenAuthorization, { isLoading: isWithdrawing, error: isWithdrawError }] =
    useWithdrawIdPortenAuthorizationMutation();

  const handleRevokeConsent = async (): Promise<void> => {
    try {
      await withdrawIdPortenAuthorization({
        id: idPortenAuthorization.authorization_id,
      }).unwrap();
    } catch {
      // Error is already tracked via revokeConsentError
    }
  };

  const { browser, os } = parseUserAgent(idPortenAuthorization.user_agent);
  let userAgentDescription: string;
  if (browser && os) {
    userAgentDescription = t('active_consents.consent_given_on_device', { browser, os });
  } else if (browser) {
    userAgentDescription = t('active_consents.consent_given_on_browser', { browser });
  } else if (os) {
    userAgentDescription = t('active_consents.consent_given_on_os', { os });
  } else {
    userAgentDescription = t('active_consents.consent_given_on_unknown_device');
  }

  return (
    <div className={classes.consentContainer}>
      <div className={classes.consentStatusBlock}>
        <ConsentStatus
          events={[]}
          isIdPortenAuthorization={true}
        />
      </div>
      <div className={classes.consentBlock}>
        <RevokeConsentPopover
          isRevoking={isWithdrawing}
          consentIsPoa={false}
          onRevokeConsent={handleRevokeConsent}
        />
        {isWithdrawError && (
          <DsAlert
            data-color='danger'
            role='alert'
          >
            {t('active_consents.revoke_consent_error')}
          </DsAlert>
        )}
        <div>
          <DsHeading
            level={1}
            data-size='md'
          >
            {idPortenAuthorization.client_name}
          </DsHeading>
          <div>{idPortenAuthorization.consumer.name}</div>
        </div>
        <div>{t('active_consents.accesses_given')}</div>
        <ConsentRights
          rights={idPortenAuthorization.scopes.map((scope) => {
            return {
              identifier: scope.name,
              title: {
                nb: scope.description,
                nn: scope.description,
                en: scope.description,
              },
              consentTextHtml: {
                nb: scope.long_description,
                nn: scope.long_description,
                en: scope.long_description,
              },
            };
          })}
          language={'nb'}
        />
        <DsHeading
          level={2}
          data-size='xs'
        >
          {t('active_consents.idporten_access_given_on_device')}
        </DsHeading>
        <div
          className={`${classes.userAgentDetails} ds-card`}
          data-color='info'
          data-variant='tinted'
        >
          <DsDetails>
            <DsDetails.Summary>{userAgentDescription}</DsDetails.Summary>
            <DsDetails.Content></DsDetails.Content>
            <DsHeading
              level={3}
              data-size='2xs'
              className={classes.userAgentDetailsHeading}
            >
              {t('active_consents.consent_information')}
            </DsHeading>
            {idPortenAuthorization.authorized_at && (
              <div>
                {t('active_consents.consent_given_at', {
                  date: toDateTimeString(
                    new Date(idPortenAuthorization.authorized_at * 1000).toISOString(),
                  ),
                })}
              </div>
            )}
            {idPortenAuthorization.expires && (
              <div>
                {t('active_consents.consent_time_limited', {
                  date: toDateTimeString(
                    new Date(idPortenAuthorization.expires * 1000).toISOString(),
                  ),
                })}
              </div>
            )}
          </DsDetails>
        </div>
      </div>
    </div>
  );
};

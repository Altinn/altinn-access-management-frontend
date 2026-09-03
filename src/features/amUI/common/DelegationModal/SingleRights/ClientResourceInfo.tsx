import { DsAlert, DsButton, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { StatusSection } from '../../StatusSection/StatusSection';
import { TechnicalErrorParagraphs } from '../../TechnicalErrorParagraphs';
import { ValidationErrorMessage } from '../../ValidationErrorMessage';

import { ResourceHeading } from './ResourceHeading';
import classes from './ResourceInfo.module.css';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import type { ActionError } from '@/resources/hooks/useActionError';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

export interface ClientResourceInfoProps {
  resource: ServiceResource;
  userHasAccess: boolean;
  toPartyName?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: ActionError | null;
  onDelegate?: () => void;
  onRevoke?: () => void;
}

export const ClientResourceInfo = ({
  resource,
  userHasAccess,
  toPartyName,
  isLoading = false,
  isSuccess = false,
  error,
  onDelegate,
  onRevoke,
}: ClientResourceInfoProps) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();

  const cannotChangeAccess = resource.delegable === false;
  const canRevoke = userHasAccess && !!onRevoke;
  const canDelegate = !userHasAccess && !!onDelegate;

  return (
    <div>
      <ResourceHeading resource={resource} />

      {isLoading || isSuccess ? (
        <LoadingAnimation
          isLoading={isLoading}
          displaySuccess={isSuccess}
        />
      ) : (
        <>
          <div
            className={classes.resourceInfo}
            data-size={isSmall ? 'xs' : 'md'}
          >
            {!!error && (
              <DsAlert
                data-color='danger'
                data-size='sm'
              >
                <DsHeading
                  level={2}
                  data-size='2xs'
                >
                  {userHasAccess
                    ? t('delegation_modal.general_error.revoke_heading')
                    : t('delegation_modal.general_error.delegate_heading')}
                </DsHeading>
                {error.details?.detail || error.details?.errorCode ? (
                  <ValidationErrorMessage
                    errorCode={error.details?.errorCode ?? error.details?.detail ?? ''}
                    translationValues={{ entity_type: t('common.persons_lowercase') }}
                  />
                ) : (
                  <TechnicalErrorParagraphs
                    size='xs'
                    status={error.httpStatus}
                    time={error.timestamp}
                  />
                )}
              </DsAlert>
            )}
            <StatusSection
              userHasAccess={userHasAccess}
              cannotDelegateHere={cannotChangeAccess}
              toPartyName={toPartyName}
            />
            {resource.description && <DsParagraph>{resource.description}</DsParagraph>}
            {resource.rightDescription && <DsParagraph>{resource.rightDescription}</DsParagraph>}
          </div>

          <div className={classes.editButtons}>
            {canRevoke && (
              <DsButton
                data-color='danger'
                disabled={cannotChangeAccess}
                onClick={onRevoke}
              >
                {t('common.delete_poa')}
              </DsButton>
            )}
            {canDelegate && (
              <DsButton
                disabled={cannotChangeAccess}
                onClick={onDelegate}
              >
                {t('common.give_poa')}
              </DsButton>
            )}
          </div>
        </>
      )}
    </div>
  );
};

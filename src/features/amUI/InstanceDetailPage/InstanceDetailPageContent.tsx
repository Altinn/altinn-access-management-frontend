import { DsAlert, DsButton, DsParagraph } from '@altinn/altinn-components';
import { Navigate, useSearchParams } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';

import { InstanceDetailHeader } from './InstanceDetailHeader';
import { ResourceInfoSkeleton } from '../common/DelegationModal/SingleRights/ResourceInfoSkeleton';
import { PageDivider } from '../common/PageDivider/PageDivider';
import UserSearch from '../common/UserSearch/UserSearch';
import { TechnicalErrorParagraphs } from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { getAfUrl } from '@/resources/utils/pathUtils';
import { AddUserButton } from './AddUserModal';
import { useInstanceDetailData } from './useInstanceDetailData';
import { CheckmarkIcon, EnvelopeClosedIcon } from '@navikt/aksel-icons';

import classes from './InstanceDetailPageContent.module.css';

export const InstanceDetailPageContent = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const instanceUrn = searchParams.get('instanceUrn') ?? '';
  const resourceId = searchParams.get('resourceId') ?? '';
  const dialogId = searchParams.get('dialogId');

  const {
    resource,
    providerLogoUrl,
    fromParty,
    isAdmin,
    isInstanceAdmin,
    users,
    indirectUsers,
    isInitialLoading,
    isUsersLoading,
    isActionLoading,
    contentTechnicalError,
  } = useInstanceDetailData({ resourceId, instanceUrn });

  if (!resourceId || !instanceUrn) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  if (isInitialLoading) {
    return <ResourceInfoSkeleton />;
  }

  const isCorrespondenceInstance = instanceUrn.startsWith('urn:altinn:correspondence-id:');
  const inboxUrl = dialogId
    ? `${getAfUrl()}inbox/${encodeURIComponent(dialogId)}`
    : `${getAfUrl()}redirect?instanceUrn=${encodeURIComponent(instanceUrn)}`;
  const showInboxLink = dialogId || !isCorrespondenceInstance;

  return (
    <>
      {resource && (
        <InstanceDetailHeader
          resource={resource}
          resourceId={resourceId}
          providerLogoUrl={providerLogoUrl}
          fromPartyName={fromParty?.name}
          fromPartyTypeName={fromParty?.partyTypeName}
        />
      )}
      {showInboxLink && (
        <div className={classes.inboxLinkContainer}>
          <DsButton
            asChild
            variant={dialogId ? 'primary' : 'secondary'}
            className={classes.inboxButton}
          >
            <a href={inboxUrl}>
              {dialogId ? <CheckmarkIcon aria-hidden /> : <EnvelopeClosedIcon aria-hidden />}
              {dialogId ? t('common.finished') : t('instance_detail_page.see_in_inbox')}
            </a>
          </DsButton>
        </div>
      )}
      <PageDivider />
      {contentTechnicalError ? (
        <DsAlert
          role='alert'
          data-color='danger'
        >
          <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
          <TechnicalErrorParagraphs
            size='sm'
            status={contentTechnicalError.status}
            time={contentTechnicalError.time}
            traceId={contentTechnicalError.traceId}
          />
        </DsAlert>
      ) : (
        <div className={classes.contentSection}>
          <DsParagraph data-size='sm'>
            {isInstanceAdmin ? (
              t('instance_detail_page.description')
            ) : (
              <Trans
                i18nKey='instance_detail_page.no_access_description'
                components={{ b: <strong /> }}
              />
            )}
          </DsParagraph>
          {(isAdmin || isInstanceAdmin) && (
            <UserSearch
              includeSelfAsChild={false}
              AddUserButton={({ isLarge }) => (
                <AddUserButton
                  isLarge={isLarge}
                  resourceId={resourceId}
                  instanceUrn={instanceUrn}
                />
              )}
              users={users}
              indirectUsers={indirectUsers}
              isLoading={isUsersLoading}
              isActionLoading={isActionLoading}
              canDelegate
              noUsersText={t('instance_detail_page.no_users')}
            />
          )}
        </div>
      )}
    </>
  );
};

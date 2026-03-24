import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  DsSpinner,
  formatDisplayName,
  Layout,
  RootProvider,
} from '@altinn/altinn-components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { getAltinnStartPageUrl, getLogoutUrl } from '@/resources/utils/pathUtils';
import { useUpdateSelectedLanguageMutation } from '@/rtk/features/settingsApi';
import classes from './DraftRequestPage.module.css';
import cn from 'classnames';
import {
  EnrichedRequestDto,
  useConfirmRequestMutation,
  useGetEnrichedDraftRequestQuery,
  useWithdrawRequestMutation,
} from '@/rtk/features/requestApi';
import { redirectToChangeReporteeAndRedirect } from '@/resources/utils/changeReporteeUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import {
  PartyRepresentationProvider,
  usePartyRepresentation,
} from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ResourceHeading } from '../common/DelegationModal/SingleRights/ResourceHeading';
import { RightsSection } from '../common/DelegationModal/SingleRights/RightsSection';
import { useRightsSection } from '../common/DelegationModal/SingleRights/hooks/useRightsSection';
import { useGetUserProfileQuery } from '@/rtk/features/userInfoApi';

export const DraftRequestPage = () => {
  const { t, i18n } = useTranslation();
  const [updateSelectedLanguage] = useUpdateSelectedLanguageMutation();

  useDocumentTitle(t('draft_request_page.page_title'));
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('id') ?? '';
  const partyUuid = getCookie('AltinnPartyUuid') || '';

  const {
    data: request,
    isLoading: isLoadingRequest,
    error: loadRequestError,
  } = useGetEnrichedDraftRequestQuery(
    { id: requestId },
    {
      skip: !requestId,
    },
  );

  const { data: userData } = useGetUserProfileQuery();

  useEffect(() => {
    // If the request is for a different user than the one currently logged in, redirect to the correct reportee
    if (request?.from.id && request.from.id !== partyUuid) {
      redirectToChangeReporteeAndRedirect(request?.from.id, window.location.href);
    }
  }, [request, partyUuid]);

  const onChangeLocale = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
    document.cookie = `selectedLanguage=${newLocale}; path=/; SameSite=Strict`;
    updateSelectedLanguage(newLocale);
  };

  const account: { name: string; type: 'person' | 'company' } = {
    name: request?.from.name ?? '',
    type: request?.from.type === 'Person' ? 'person' : 'company',
  };

  return (
    <RootProvider>
      <Layout
        color='neutral'
        theme='subtle'
        header={{
          locale: {
            title: t('header.locale_title'),
            options: [
              { label: 'Norsk (bokmål)', value: 'no_nb', checked: i18n.language === 'no_nb' },
              { label: 'Norsk (nynorsk)', value: 'no_nn', checked: i18n.language === 'no_nn' },
              { label: 'English', value: 'en', checked: i18n.language === 'en' },
            ],
            onSelect: onChangeLocale,
          },
          logo: {
            href: getAltinnStartPageUrl(i18n.language),
            title: 'Altinn',
          },
          currentAccount: {
            ...account,
            id: '',
            icon: account,
          },
          globalMenu: {
            logoutButton: {
              label: t('header.log_out'),
              onClick: () => {
                const logoutUrl = getLogoutUrl();
                window.location.assign(logoutUrl);
              },
            },
            menuLabel: t('header.menu-label'),
            backLabel: t('header.back-label'),
            changeLabel: t('header.change-label'),
            menu: {
              items: [{ groupId: 'current-user', hidden: true }],
              groups: {
                'current-user': {
                  title: t('header.logged_in_as_name', {
                    name: formatDisplayName({
                      fullName: userData?.name || '',
                      type: 'person',
                      reverseNameOrder: true,
                    }),
                  }),
                },
              },
            },
          },
        }}
      >
        {isLoadingRequest && <LoadingState />}
        {loadRequestError && (
          <DsAlert data-color='danger'>{t('draft_request_page.load_request_error')}</DsAlert>
        )}
        {request && (
          <PartyRepresentationProvider
            fromPartyUuid={partyUuid}
            actingPartyUuid={partyUuid}
            toPartyUuid={''}
            loadingComponent={<LoadingState />}
          >
            <InnerContent request={request} />
          </PartyRepresentationProvider>
        )}
      </Layout>
    </RootProvider>
  );
};

const LoadingState = () => {
  const { t } = useTranslation();
  return (
    <div className={classes.centerBlock}>
      <DsSpinner
        aria-label={t('draft_request_page.loading_request')}
        data-size='lg'
      />
    </div>
  );
};

interface InnerContentProps {
  request: EnrichedRequestDto;
}

const InnerContent = ({ request }: InnerContentProps) => {
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

  const { rights, setRights } = useRightsSection({ resource: request.resource, isRequest: true });

  const onConfirmRequest = () => {
    confirmRequest({ party: request.from.id, id: request.id });
  };

  const onWithdrawRequest = () => {
    withdrawRequest({ party: request.from.id, id: request.id });
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
        <div className={classes.resourceInfo}>
          {request.resource.description && (
            <DsParagraph>{request.resource.description}</DsParagraph>
          )}
          {request.resource.rightDescription && (
            <DsParagraph>{request.resource.rightDescription}</DsParagraph>
          )}
        </div>
        <RightsSection
          rights={rights}
          setRights={setRights}
          undelegableActions={[]}
          isDelegationCheckLoading={false}
          toName={isSelfParty ? t('common.you_uppercase') : fromName}
          isSingleRightRequest={true}
          availableActions={[]}
          delegationError={null}
          missingAccess={null}
        />
        <div>
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
        <DsParagraph>
          <div className={classes.closeWindowInfo}>{t('draft_request_page.close_window_info')}</div>
        </DsParagraph>
      </div>
    </div>
  );
};

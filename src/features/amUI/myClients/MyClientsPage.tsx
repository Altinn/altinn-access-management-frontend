import React, { useCallback, useMemo } from 'react';
import {
  DsAlert,
  DsParagraph,
  DsSkeleton,
  formatDisplayName,
  Snackbar,
  SnackbarDuration,
  SnackbarProvider,
  useSnackbar,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';
import {
  useGetMyClientsQuery,
  useRemoveMyClientAccessPackagesMutation,
  type Client,
} from '@/rtk/features/clientApi';
import { PartyType, useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { ClientAccessList, type ClientAccessPackageAction } from '../common/ClientAccessList';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { ReporteePageHeading } from '../common/ReporteePageHeading';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { MyClientsDeleteClientProviderModal } from './MyClientsDeleteClientProviderModal';

import classes from './MyClientsPage.module.css';

type MyClientsAccessSectionProps = {
  clients: Client[];
  actingPartyUuid: string;
  currentUserName: string;
};

const MyClientsAccessSection = ({
  clients,
  actingPartyUuid,
  currentUserName,
}: MyClientsAccessSectionProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const [removeMyClientAccessPackages, { isLoading: isRemovingMyClientAccessPackages }] =
    useRemoveMyClientAccessPackagesMutation();

  const onRemoveAccessPackage = useCallback(
    async ({ clientId, roleCode, packageId, accessPackageName }: ClientAccessPackageAction) => {
      if (!actingPartyUuid) {
        return;
      }

      try {
        await removeMyClientAccessPackages({
          provider: actingPartyUuid,
          from: clientId,
          payload: {
            values: [
              {
                role: roleCode,
                packages: [packageId],
              },
            ],
          },
        }).unwrap();
        openSnackbar({
          message: t('my_clients_page.remove_package_success_snackbar', {
            name: currentUserName,
            accessPackage: accessPackageName,
          }),
          color: 'success',
        });
      } catch {
        openSnackbar({
          message: t('my_clients_page.remove_package_error', {
            name: currentUserName,
            accessPackage: accessPackageName,
          }),
          color: 'danger',
          duration: SnackbarDuration.infinite,
        });
      }
    },
    [actingPartyUuid, currentUserName, openSnackbar, removeMyClientAccessPackages, t],
  );

  return (
    <>
      <ClientAccessList
        clients={clients}
        accessStateClients={clients}
        removeDisabled={isRemovingMyClientAccessPackages || !actingPartyUuid}
        onRemoveAccessPackage={onRemoveAccessPackage}
        requireDelegableForActions={false}
        searchPlaceholder={t('my_clients_page.search_placeholder')}
      />
      <Snackbar />
    </>
  );
};

export const MyClientsPage = () => {
  const { t } = useTranslation();
  const actingPartyUuid = getCookie('AltinnPartyUuid') ?? '';

  useDocumentTitle(t('my_clients_page.page_title'));

  const {
    data: currentUser,
    isLoading: isLoadingCurrentUser,
    error: currentUserError,
  } = useGetPartyFromLoggedInUserQuery();
  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();

  const isActingOnBehalfOfSelf = currentUser?.partyUuid === actingPartyUuid;

  const {
    data: myClientsByProvider,
    isLoading: isLoadingMyClients,
    error: myClientsError,
  } = useGetMyClientsQuery(
    { provider: [actingPartyUuid] },
    {
      skip:
        !actingPartyUuid || !currentUser?.partyUuid || isActingOnBehalfOfSelf || !!currentUserError,
    },
  );

  const clients = useMemo(() => {
    const dedupedClients = new Map<string, Client>();
    (myClientsByProvider ?? []).forEach((providerWithClients) => {
      providerWithClients.clients.forEach((client) => {
        const hasDelegatedAccess = client.access.some((access) => access.packages.length > 0);
        if (hasDelegatedAccess && !dedupedClients.has(client.client.id)) {
          dedupedClients.set(client.client.id, client);
        }
      });
    });

    return [...dedupedClients.values()];
  }, [myClientsByProvider]);

  const currentUserName =
    formatDisplayName({
      fullName: currentUser?.name || '',
      type: currentUser?.partyTypeName === PartyType.Person ? 'person' : 'company',
    }) || t('common.you_uppercase');

  const pageName =
    formatDisplayName({
      fullName: reportee?.name || '',
      type: reportee?.type === 'Person' ? 'person' : 'company',
    }) || t('common.you_uppercase');

  const errorDetails = createErrorDetails(myClientsError || currentUserError);
  const canDeleteProviderRelation =
    !!actingPartyUuid && !!currentUser?.partyUuid && currentUser.partyUuid !== actingPartyUuid;

  return (
    <PageWrapper
      pageAction={
        canDeleteProviderRelation ? (
          <MyClientsDeleteClientProviderModal
            provider={actingPartyUuid}
            providerName={pageName}
            selfPartyUuid={currentUser?.partyUuid}
          />
        ) : undefined
      }
    >
      <PageLayoutWrapper>
        <Breadcrumbs items={['root', 'my_clients']} />
        <ReporteePageHeading
          title={t('my_clients_page.main_page_heading', { name: pageName })}
          reportee={reportee}
          isLoading={isLoadingReportee}
        />
        <div className={classes.content}>
          {isActingOnBehalfOfSelf ? (
            <DsAlert data-color='info'>{t('my_clients_page.not_acting_on_behalf_info')}</DsAlert>
          ) : errorDetails ? (
            <DsAlert data-color='danger'>
              <TechnicalErrorParagraphs
                status={errorDetails.status}
                time={errorDetails.time}
                traceId={errorDetails.traceId}
              />
            </DsAlert>
          ) : isLoadingCurrentUser || isLoadingMyClients ? (
            <DsSkeleton
              variant='rectangle'
              width='100%'
              height='220px'
            />
          ) : clients.length > 0 ? (
            <SnackbarProvider>
              <MyClientsAccessSection
                clients={clients}
                actingPartyUuid={actingPartyUuid}
                currentUserName={currentUserName}
              />
            </SnackbarProvider>
          ) : (
            <DsParagraph>{t('my_clients_page.no_clients')}</DsParagraph>
          )}
        </div>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

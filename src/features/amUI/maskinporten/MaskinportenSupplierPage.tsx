import React, { useMemo, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  Snackbar,
  SnackbarDuration,
  SnackbarProvider,
  formatDisplayName,
  useSnackbar,
} from '@altinn/altinn-components';
import { TrashIcon } from '@navikt/aksel-icons';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import type { Party } from '@/rtk/features/lookupApi';
import {
  useGetMaskinportenResourcesQuery,
  useGetMaskinportenSuppliersQuery,
  useRemoveMaskinportenSupplierMutation,
} from '@/rtk/features/maskinportenApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';

import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { DelegationModal, DelegationType } from '../common/DelegationModal/DelegationModal';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import { DelegationAction } from '../common/DelegationModal/EditModal';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { MaskinportenDeleteDialog } from './MaskinportenDeleteDialog';
import classes from './MaskinportenPage.module.css';

export const MaskinportenSupplierPage = () => {
  return (
    <SnackbarProvider>
      <MaskinportenSupplierPageContent />
      <Snackbar />
    </SnackbarProvider>
  );
};

const MaskinportenSupplierPageContent = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('maskinporten_page.supplier_title'));

  const { id: orgNr } = useParams<{ id: string }>();
  const party = getCookie('AltinnPartyUuid');
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [removeSupplier, { isLoading: isRemoving }] = useRemoveMaskinportenSupplierMutation();

  const { data, isLoading, error } = useGetMaskinportenSuppliersQuery(
    { party, supplier: orgNr },
    { skip: !party || !orgNr },
  );
  const {
    data: resourcePermissions,
    error: resourcesError,
    isFetching: isResourcesFetching,
  } = useGetMaskinportenResourcesQuery({ party, supplier: orgNr }, { skip: !party || !orgNr });

  const supplier = data?.[0];
  const supplierName = supplier?.party.name
    ? formatDisplayName({ fullName: supplier?.party.name, type: 'company' })
    : '';

  const supplierParty = useMemo((): Party | undefined => {
    const party = supplier?.party;
    if (!party) {
      return undefined;
    }
    return {
      partyUuid: party.id,
      partyId: 0,
      name: party.name,
      partyTypeName: PartyType.Organization,
      orgNumber: party.organizationIdentifier ?? '',
      isDeleted: party.isDeleted ?? false,
    };
  }, [supplier]);
  const delegatedResources = useMemo(
    () =>
      (resourcePermissions ?? [])
        .map((delegation) => delegation.resource)
        .filter((resource) => resource.identifier),
    [resourcePermissions],
  );

  const handleConfirmDelete = async () => {
    if (!orgNr || !party) return;
    try {
      await removeSupplier({ party, supplier: orgNr, cascade: true }).unwrap();
      dialogRef.current?.close();
      openSnackbar({
        message: t('maskinporten_page.remove_supplier_success', { name: supplierName }),
        color: 'success',
        duration: SnackbarDuration.normal,
      });
      navigate(`/${amUIPath.Maskinporten}`);
    } catch {
      openSnackbar({
        message: t('maskinporten_page.remove_supplier_error', { name: supplierName }),
        color: 'danger',
        duration: SnackbarDuration.infinite,
      });
    }
  };

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={party}
          actingPartyUuid={party}
          toPartyOverride={supplierParty}
        >
          <DelegationModalProvider>
            <Breadcrumbs
              items={['root', 'maskinporten']}
              lastBreadcrumb={{ label: supplierName || t('maskinporten_page.supplier_title') }}
            />

            <PageContainer
              backUrl={`/${amUIPath.Maskinporten}`}
              contentActions={[
                <DsButton
                  key='delete'
                  data-color='danger'
                  data-size='sm'
                  variant='tertiary'
                  onClick={() => dialogRef.current?.showModal()}
                >
                  <TrashIcon aria-hidden='true' />
                  {t('maskinporten_page.remove_supplier_confirm')}
                </DsButton>,
              ]}
            >
              {error || (!isLoading && !data?.length) ? (
                <DsAlert data-color='danger'>
                  <DsParagraph>
                    {t('maskinporten_page.supplier_not_found')}{' '}
                    <Link to={`/${amUIPath.Maskinporten}`}>
                      {t('maskinporten_page.back_to_list')}
                    </Link>
                  </DsParagraph>
                </DsAlert>
              ) : isLoading ? (
                <DsSkeleton
                  width='100%'
                  height='2.5rem'
                />
              ) : (
                <>
                  <div className={classes.supplierHeader}>
                    <DsHeading
                      level={1}
                      data-size='lg'
                    >
                      {supplierName}
                    </DsHeading>
                  </div>
                  <DelegationModal
                    delegationType={DelegationType.MaskinportenScope}
                    availableActions={[DelegationAction.DELEGATE]}
                  />
                </>
              )}

              <MaskinportenDeleteDialog
                ref={dialogRef}
                heading={t('maskinporten_page.remove_supplier_heading')}
                body={t('maskinporten_page.remove_supplier_body', { name: supplierName })}
                confirmLabel={t('maskinporten_page.remove_supplier_confirm')}
                onConfirm={handleConfirmDelete}
                onClose={() => {}}
                isLoading={isRemoving}
              />
            </PageContainer>
          </DelegationModalProvider>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

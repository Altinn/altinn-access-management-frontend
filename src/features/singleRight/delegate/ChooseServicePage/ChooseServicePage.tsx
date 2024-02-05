/* eslint-disable @typescript-eslint/restrict-plus-operands */
import * as React from 'react';
import { PersonIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Ingress, Heading, Paragraph, Popover } from '@digdir/design-system-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Page, PageHeader, PageContent, PageContainer, GroupElements } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import {
  UserType,
  useGetUserByUUIDQuery,
  useGetPartyByUUIDQuery,
} from '@/rtk/features/lookup/lookupApi';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import {
  type DelegationAccessCheckDto,
  delegationAccessCheck,
  removeServiceResource,
  resetProcessedDelegations,
  ServiceStatus,
} from '@/rtk/features/singleRights/singleRightsSlice';
import { GeneralPath, SingleRightPath } from '@/routes/paths';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { SearchSection } from '../../components/SearchSection';
import { ResourceCollectionBar } from '../../components/ResourceCollectionBar';

export const ChooseServicePage = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [userUUID, setUserUUID] = useState<string | null>(null);
  const [partyUUID, setPartyUUID] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState<string | undefined>(undefined);
  const [recipientError, setRecipientError] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const delegableChosenServices = useAppSelector((state) =>
    state.singleRightsSlice.servicesWithStatus.filter(
      (s) => s.status === ServiceStatus.Delegable || s.status === ServiceStatus.PartiallyDelegable,
    ),
  );

  const {
    data: user,
    error: getUserError,
    isLoading: getUserIsLoading,
  } = useGetUserByUUIDQuery(userUUID ?? '');
  const {
    data: party,
    error: getPartyError,
    isLoading: getPartyIsLoading,
  } = useGetPartyByUUIDQuery(partyUUID ?? '');

  const [urlParams] = useSearchParams();

  useLayoutEffect(() => {
    void dispatch(resetProcessedDelegations());
    setUserUUID(urlParams.get('userUUID'));
    setPartyUUID(urlParams.get('partyUUID'));
  }, []);

  useEffect(() => {
    if (userUUID && !getUserIsLoading) {
      if (getUserError) {
        setRecipientError(true);
      } else {
        switch (user?.userType) {
          case UserType.SSNIdentified:
            // Recipient is a person
            setRecipientName(user.party.name);
            break;
          case UserType.EnterpriseIdentified:
            // Recipient is an enterprize user
            setRecipientName(`${user.userName} (${user.party.orgNumber})`);
            break;
          default:
            // Recipient is null or is of a type that cannot be delegated to
            setRecipientError(true);
        }
      }
    } else if (partyUUID && !getPartyIsLoading) {
      // Fetch party from getParty query
      if (getPartyError) {
        setRecipientError(true);
      } else {
        setRecipientName(`${party?.name} (${party?.orgNumber})`);
      }
    } else if (!getUserIsLoading && !getPartyIsLoading) {
      // No UUID given -> Display Error
      setRecipientError(true);
    }
  }, [getUserIsLoading, getPartyIsLoading]);

  const onAdd = (serviceResource: ServiceResource) => {
    const dto: DelegationAccessCheckDto = {
      serviceResource,
      resourceReference: serviceResource.authorizationReference,
    };

    void dispatch(delegationAccessCheck(dto));
  };

  const onRemove = (identifier: string | undefined) => {
    void dispatch(removeServiceResource(identifier));
  };

  const onCancel = () => {
    const cleanHostname = window.location.hostname.replace('am.ui.', '');
    const partyId = getCookie('AltinnPartyId');
    const encodedUrl = `ui/AccessManagement/ServicesAvailableForActor?userID=&amp;partyID=${partyId}`;

    window.location.href =
      'https://' +
      cleanHostname +
      '/' +
      String(GeneralPath.Altinn2SingleRights) +
      '?userID=' +
      getCookie('AltinnUserId') +
      '&amp;' +
      'partyID=' +
      getCookie('AltinnPartyId') +
      encodeURIComponent(encodedUrl);
  };

  const recipientErrorAlert = () => {
    if (!userUUID && !partyUUID) {
      return (
        <Alert severity='danger'>
          <Heading
            level={3}
            size='small'
          >
            Mottaker mangler
          </Heading>
          <Paragraph>
            Mottaker for delegeringen mangler. Vennligst gå tilbake til Profilsiden og velg mottaker
            for delegeringen
          </Paragraph>
        </Alert>
      );
    } else {
      return (
        <Alert severity='danger'>
          <Heading
            level={3}
            size='small'
          >
            Kan ikke delegere til mottaker
          </Heading>
          <Paragraph>
            Oppgitt mottaker kan ikke delegeres til. Vennligst gå tilbake til Profilsiden og velg en
            annen. Mottaker må være en organisasjon, eller virksomhetsbruker, eller en person
            registrert med fødselsnummer. Selvregistrerte brukere kan ikke delegeres til.
          </Paragraph>
        </Alert>
      );
    }
  };

  return (
    <PageContainer>
      <Page
        color='dark'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent>
          {recipientError ? (
            recipientErrorAlert()
          ) : (
            <>
              <Ingress spacing>
                {t('single_rights.delegate_choose_service_page_top_text', { name: recipientName })}
              </Ingress>
              <ResourceCollectionBar
                resources={delegableChosenServices.map(
                  (servicewithStatus) => servicewithStatus.service,
                )}
                onRemove={onRemove}
                compact={isSm}
                proceedToPath={`/${SingleRightPath.DelegateSingleRights}/${SingleRightPath.ChooseRights}?${urlParams}`}
              />
              <SearchSection
                onAdd={onAdd}
                onUndo={onRemove}
              />
              <GroupElements>
                <Button
                  variant='primary'
                  color='first'
                  disabled={delegableChosenServices.length < 1}
                  fullWidth
                  onClick={() => {
                    navigate(
                      `/${SingleRightPath.DelegateSingleRights}/${SingleRightPath.ChooseRights}?${urlParams}`,
                    );
                  }}
                >
                  {t('common.proceed')}
                </Button>
                <Button
                  variant='tertiary'
                  color={delegableChosenServices.length > 0 ? 'danger' : 'first'}
                  size='medium'
                  onClick={
                    delegableChosenServices.length > 0
                      ? () => setPopoverOpen(!popoverOpen)
                      : onCancel
                  }
                  ref={buttonRef}
                >
                  {t('common.cancel')}
                </Button>
                <Popover
                  variant={'warning'}
                  placement='top'
                  anchorEl={buttonRef.current}
                  open={popoverOpen}
                  onClose={() => setPopoverOpen(false)}
                >
                  <Popover.Content>
                    <Paragraph>{t('single_rights.cancel_popover_text')}</Paragraph>
                    <GroupElements>
                      <Button
                        onClick={onCancel}
                        color={'danger'}
                        variant={'primary'}
                        fullWidth
                      >
                        {t('common.yes')}
                      </Button>
                      <Button
                        onClick={() => setPopoverOpen(false)}
                        color={'danger'}
                        variant={'tertiary'}
                      >
                        {t('single_rights.no_continue_delegating')}
                      </Button>
                    </GroupElements>
                  </Popover.Content>
                </Popover>
              </GroupElements>
            </>
          )}
        </PageContent>
      </Page>
    </PageContainer>
  );
};

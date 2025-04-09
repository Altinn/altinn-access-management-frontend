import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Spinner } from '@digdir/designsystemet-react';
import { Link, useNavigate } from 'react-router';

import {
  useCreateSystemUserMutation,
  useGetRegisteredSystemRightsQuery,
} from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { SystemUserPath } from '@/routes/paths';
import { PageContainer } from '@/features/amUI/common/PageContainer/PageContainer';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import type { ProblemDetail, RegisteredSystem } from '../types';
import { RightsList } from '../components/RightsList/RightsList';
import { DelegationCheckError } from '../components/DelegationCheckError/DelegationCheckError';
import { ButtonRow } from '../components/ButtonRow/ButtonRow';
import { SystemUserHeader } from '../components/SystemUserHeader/SystemUserHeader';

import classes from './CreateSystemUser.module.css';

interface RightsIncludedProps {
  selectedSystem: RegisteredSystem;
  onNavigateBack: () => void;
}

export const RightsIncluded = ({ selectedSystem, onNavigateBack }: RightsIncludedProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const partyId = getCookie('AltinnPartyUuid');
  const { data: reporteeData } = useGetReporteeQuery();

  const {
    data: rights,
    isLoading: isLoadingRights,
    isError: isLoadRightsError,
  } = useGetRegisteredSystemRightsQuery(selectedSystem.systemId);

  const [postNewSystemUser, { error: createSystemUserError, isLoading: isCreatingSystemUser }] =
    useCreateSystemUserMutation();

  const handleConfirmSystemUser = () => {
    if (selectedSystem) {
      const postObjekt = {
        integrationTitle: selectedSystem.name,
        systemId: selectedSystem.systemId,
        partyId: partyId,
      };

      postNewSystemUser(postObjekt)
        .unwrap()
        .then((newSystemUser: { id: string }) => {
          navigate(`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`, {
            state: { createdId: newSystemUser.id },
          });
        });
    }
  };

  const numberOfRights = (rights?.resources?.length || 0) + (rights?.accessPackages?.length || 0);

  if (isLoadingRights) {
    return <Spinner aria-label={t('systemuser_includedrightspage.loading_rights')} />;
  }

  return (
    <PageContainer onNavigateBack={onNavigateBack}>
      <div className={classes.creationPageContainer}>
        <div className={classes.creationPageHeader}>
          <SystemUserHeader
            title={t(
              numberOfRights === 1
                ? 'systemuser_includedrightspage.header_single'
                : 'systemuser_includedrightspage.header',
              {
                integrationTitle: selectedSystem.name,
                companyName: reporteeData?.name,
              },
            )}
          />
        </div>
        <div>
          <RightsList
            resources={rights?.resources ?? []}
            accessPackages={rights?.accessPackages ?? []}
          />
          {createSystemUserError && (
            <DelegationCheckError
              defaultError='systemuser_includedrightspage.create_systemuser_error'
              error={createSystemUserError as { data: ProblemDetail }}
            />
          )}
          {isLoadRightsError && (
            <Alert
              data-color='danger'
              role='alert'
            >
              {t('systemuser_includedrightspage.load_rights_error')}
            </Alert>
          )}
          <ButtonRow>
            <Button
              variant='primary'
              onClick={handleConfirmSystemUser}
              disabled={isCreatingSystemUser || isLoadRightsError}
              loading={isCreatingSystemUser}
            >
              {isCreatingSystemUser
                ? t('systemuser_includedrightspage.creating_systemuser')
                : t('systemuser_includedrightspage.confirm_button')}
            </Button>
            <Button
              variant='tertiary'
              asChild
            >
              <Link to={`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`}>
                {t('common.cancel')}
              </Link>
            </Button>
          </ButtonRow>
        </div>
      </div>
    </PageContainer>
  );
};

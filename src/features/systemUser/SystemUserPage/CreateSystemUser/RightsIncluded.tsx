import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Heading, Paragraph, Spinner } from '@digdir/designsystemet-react';

import {
  useCreateSystemUserMutation,
  useGetRegisteredSystemRightsQuery,
} from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import type { ProblemDetail, RegisteredSystem } from '../../types';
import { RightsList } from '../../components/RightsList/RightsList';
import { DelegationCheckError } from '../../components/DelegationCheckError/DelegationCheckError';
import { ButtonRow } from '../../components/ButtonRow/ButtonRow';

interface RightsIncludedProps {
  selectedSystem: RegisteredSystem;
  handleCancel: () => void;
}

export const RightsIncluded = ({ selectedSystem, handleCancel }: RightsIncludedProps) => {
  const { t } = useTranslation();
  const partyId = getCookie('AltinnPartyId');

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
        .then(() => {
          handleCancel(); // TODO
        });
    }
  };

  if (isLoadingRights) {
    return (
      <Spinner
        aria-label={t('systemuser_includedrightspage.loading_rights')}
        title={''}
      />
    );
  }

  return (
    <>
      <Heading
        level={2}
        data-size='sm'
      >
        {rights?.length === 1
          ? t('systemuser_includedrightspage.sub_title_single')
          : t('systemuser_includedrightspage.sub_title')}
      </Heading>
      <Paragraph data-size='sm'>
        {rights?.length === 1
          ? t('systemuser_includedrightspage.content_text_single')
          : t('systemuser.content_text')}
      </Paragraph>
      <div>
        <RightsList resources={rights ?? []} />
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
            data-size='sm'
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
            data-size='sm'
            onClick={handleCancel}
          >
            {t('common.cancel')}
          </Button>
        </ButtonRow>
      </div>
    </>
  );
};

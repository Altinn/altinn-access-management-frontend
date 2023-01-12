import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '@/rtk/app/hooks';

import { ConfirmationPage, PageContainer } from '../Reusables';
import { ListTextColor } from '../Reusables/CompactDeletableListItem/CompactDeletableListItem';

import classes from './ApiDelegationReceiptPage.module.css';

export const ApiDelegationReceiptPage = () => {
  const failedApiDelegations = useAppSelector(
    (state) => state.delegationRequest.failedApiDelegations,
  );
  const succesfulApiDelegations = useAppSelector(
    (state) => state.delegationRequest.succesfulApiDelegations,
  );
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return;
  <PageContainer>
    <ConfirmationPage
      delegableApis={failedApiDelegations}
      topListColor={ListTextColor.primary}
      failedDelegations={failedApiDelegations}
      successfulDelegations={succesfulApiDelegations}
    ></ConfirmationPage>
  </PageContainer>;
};

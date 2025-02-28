import { useTranslation } from 'react-i18next';
import type { ButtonProps } from '@altinn/altinn-components';
import { Button } from '@altinn/altinn-components';
import { PlusCircleIcon } from '@navikt/aksel-icons';

export const RequestRoleButton = ({ ...props }: ButtonProps) => {
  const { t } = useTranslation();
  // Todo: Implement request role button
  return (
    <Button
      variant='text'
      disabled
      icon={PlusCircleIcon}
      size='sm'
      {...props}
    >
      {t('common.request_poa')}
    </Button>
  );
};

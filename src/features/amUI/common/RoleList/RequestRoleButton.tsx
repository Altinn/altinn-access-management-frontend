import { useTranslation } from 'react-i18next';
import type { ButtonProps } from '@altinn/altinn-components';
import { Button } from '@altinn/altinn-components';
import { PlusCircleIcon } from '@navikt/aksel-icons';

interface RequestRoleButtonProps extends Omit<ButtonProps, 'icon'> {
  icon?: boolean;
}

export const RequestRoleButton = ({ icon = true, ...props }: RequestRoleButtonProps) => {
  const { t } = useTranslation();
  // Todo: Implement request role button
  return (
    <Button
      variant='text'
      disabled
      icon={icon ? PlusCircleIcon : undefined}
      size='sm'
      {...props}
    >
      {t('common.request_poa')}
    </Button>
  );
};

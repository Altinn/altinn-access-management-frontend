import { useTranslation } from 'react-i18next';
import type { ButtonProps } from '@altinn/altinn-components';
import { Button } from '@altinn/altinn-components';

export const RequestRoleButton = ({ variant = 'outline', ...props }: ButtonProps) => {
  const { t } = useTranslation();
  // Todo: Implement request role button
  return (
    <Button
      {...props}
      variant={variant}
      disabled
      size='sm'
    >
      {t('common.request_poa')}
    </Button>
  );
};

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { Button, ButtonProps } from '@altinn/altinn-components';

interface RightsActionButtonProps extends Omit<ButtonProps, 'children'> {
  label: string;
}

export const RightsActionButton = ({ icon, label, ...props }: RightsActionButtonProps) => {
  const isSmall = useIsMobileOrSmaller();
  return (
    <Button
      {...props}
      icon={icon}
      size={isSmall ? 'sm' : 'md'}
      aria-label={isSmall ? label : undefined}
    >
      {!isSmall && label}
    </Button>
  );
};

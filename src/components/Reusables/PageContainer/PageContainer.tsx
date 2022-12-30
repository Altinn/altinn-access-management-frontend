import { Button, ButtonColor, ButtonSize, ButtonVariant } from '@altinn/altinn-design-system';
import { useNavigate } from 'react-router-dom';

import { ReactComponent as ExitIcon } from '@/assets/Error.svg';

import classes from './PageContainer.module.css';

export interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer = ({ children }: PageContainerProps) => {
  const navigate = useNavigate();

  return (
    <div className={classes.pageWrapper}>
      <div className={classes.exitButton}>
        <Button
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Inverted}
          size={ButtonSize.Medium}
          icon={<ExitIcon />}
          onClick={() => navigate('/Profile')}
        ></Button>
      </div>
      <div>{children}</div>
    </div>
  );
};

import { SvgIcon } from '@altinn/altinn-design-system';
import * as React from 'react';
import { Office1Filled } from '@navikt/ds-icons';

import { ReactComponent as AltinnLogo } from '@/assets/AltinnTextLogo.svg';

import classes from './UserInfoBar.module.css';

export const UserInfoBar = () => {
  return (
    <div className={classes.userInfoBar}>
      <div className={classes.altinnLogo}>
        <AltinnLogo />
      </div>
      <div className={classes.userInfoBar}>
        <div>
          <h5 className={classes.userText}>Arne Utvikler</h5>
          <h5 className={classes.userText}>for SPAREBANK 1 Utvikling</h5>
        </div>
        <div>
          <SvgIcon
            width={24}
            height={24}
            svgIconComponent={<Office1Filled />}
          ></SvgIcon>
        </div>
      </div>
    </div>
  );
};

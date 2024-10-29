import React from 'react';
import { Divider, Label } from '@digdir/designsystemet-react';
import {
  ClockDashedIcon,
  HandshakeIcon,
  PersonGroupIcon,
  RobotSmileIcon,
} from '@navikt/aksel-icons';

import AltinnTextLogo from '@/assets/AltinnTextLogo.svg?react';

import { Avatar } from '../Avatar/Avatar';

import classes from './FakePageWrapper.module.css';

interface FakePageWrapperProps {
  reporteeName: string;
  children?: React.ReactNode;
}

export const FakePageWrapper = ({
  reporteeName,
  children,
}: FakePageWrapperProps): React.ReactNode => {
  return (
    <div className={classes.pageWrapper}>
      <div className={classes.topBar}>
        <AltinnTextLogo title='Altinn' />
        <div className={classes.menuButton}>
          <span>Meny</span>
          <Avatar
            profile='organization'
            size='sm'
            name={reporteeName}
          />
        </div>
      </div>
      <div className={classes.contentWrapper}>
        <div className={classes.sideMenu}>
          <Label className={classes.companyTitle}>
            <Avatar
              profile='serviceOwner'
              size='lg'
              name='Tilgangsstyring'
            />
            Tilgangsstyring
          </Label>
          <Divider />
          {[
            { title: 'Brukere og grupper', icon: <PersonGroupIcon /> },
            { title: 'Fullmakter', icon: <HandshakeIcon /> },
            { title: 'Maskintilganger', icon: <RobotSmileIcon /> },
            { title: 'Aktivitetslogg', icon: <ClockDashedIcon /> },
            { title: 'Virksomhetsprofil', icon: <HandshakeIcon /> },
          ].map((item) => {
            return (
              <div
                key={item.title}
                className={classes.sideMenuItem}
              >
                {item.icon}
                {item.title}
              </div>
            );
          })}
        </div>
        <div className={classes.pageContent}>{children}</div>
      </div>
    </div>
  );
};

import React from 'react';
import { Divider, Label, Search } from '@digdir/designsystemet-react';
import {
  ClockDashedIcon,
  HandshakeIcon,
  PersonGroupIcon,
  RobotSmileIcon,
} from '@navikt/aksel-icons';

import AltinnTextLogo from '@/assets/AltinnTextLogo.svg?react';

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
        <div>
          <Search placeholder='Søk i Altinn' />
        </div>
        <div className={classes.menuButton}>
          <span>Meny</span>
          <div className={classes.companySquare} />
        </div>
      </div>
      <div className={classes.contentWrapper}>
        <div className={classes.sideMenu}>
          <Label className={classes.companyTitle}>
            <span className={classes.companySquare} />
            {reporteeName}
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

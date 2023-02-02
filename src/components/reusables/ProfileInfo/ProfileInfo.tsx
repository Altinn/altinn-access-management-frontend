import { SvgIcon } from '@altinn/altinn-design-system';
import * as React from 'react';
import { Office1Filled } from '@navikt/ds-icons';

interface ProfileInfoProps {
  children: React.ReactNode;
}

export const ProfileInfo = ({ children }: ProfileInfoProps) => {
  return (
    <div>
      <div>
        <SvgIcon
          width={14}
          height={14}
          svgIconComponent={<Office1Filled />}
        ></SvgIcon>
      </div>
      <div>{children}</div>
    </div>
  );
};

import { Icon, DsHeading } from '@altinn/altinn-components';
import { PackageIcon } from '@navikt/aksel-icons';

import classes from './AccessPackageInfo.module.css';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

interface PackageHeaderProps {
  name: string;
  level?: 1 | 2 | 3;
}

export const PackageHeader = ({ name, level = 1 }: PackageHeaderProps) => {
  const isSmall = useIsMobileOrSmaller();

  return (
    <div className={classes.header}>
      {!isSmall && (
        <Icon
          size='md'
          svgElement={PackageIcon}
          className={classes.headerIcon}
        />
      )}
      <DsHeading
        level={level}
        data-size={isSmall ? 'xs' : 'md'}
      >
        {name}
      </DsHeading>
    </div>
  );
};

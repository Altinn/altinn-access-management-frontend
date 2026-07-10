import { Icon, DsHeading } from '@altinn/altinn-components';
import { PackageIcon } from '@navikt/aksel-icons';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import classes from './AccessPackageInfo.module.css';

interface PackageHeaderProps {
  name: string;
}

export const PackageHeader = ({ name }: PackageHeaderProps) => {
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
        level={1}
        data-size={isSmall ? 'xs' : 'md'}
      >
        {name}
      </DsHeading>
    </div>
  );
};

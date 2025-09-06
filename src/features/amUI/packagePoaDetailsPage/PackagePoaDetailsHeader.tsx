import React from 'react';
import classes from './PackagePoaDetailsHeader.module.css';
import { Avatar, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { PackageIcon } from '@navikt/aksel-icons';
import { PartyType } from '@/rtk/features/userInfoApi';
import { PackagePoaDetailsHeaderSkeleton } from './PackagePoaDetailsHeaderSkeleton';

interface PackagePoaDetailsHeaderProps {
  packageName?: string;
  packageDescription?: string;
  fromPartyName?: string;
  fromPartyTypeName?: PartyType | string;
  isLoading?: boolean;
}

export const PackagePoaDetailsHeader: React.FC<PackagePoaDetailsHeaderProps> = ({
  packageName = '',
  packageDescription = '',
  fromPartyName = '',
  fromPartyTypeName,
  isLoading = false,
}) => {
  const avatarType = fromPartyTypeName === PartyType.Organization ? 'company' : 'person';
  return isLoading ? (
    <PackagePoaDetailsHeaderSkeleton />
  ) : (
    <>
      <div className={classes.packageIconContainer}>
        <PackageIcon className={classes.packageIcon} />
        <Avatar
          name={fromPartyName}
          type={avatarType}
          className={classes.packageAvatar}
          size='xs'
        />
      </div>
      <DsHeading
        level={1}
        data-size='lg'
        className={classes.pageHeading}
      >
        {packageName}
      </DsHeading>
      <DsParagraph
        variant='long'
        className={classes.pageDescription}
      >
        {packageDescription}
      </DsParagraph>
    </>
  );
};

export default PackagePoaDetailsHeader;

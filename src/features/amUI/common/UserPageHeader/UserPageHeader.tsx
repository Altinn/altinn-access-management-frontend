import {
  DsParagraph,
  DsHeading,
  MenuItemIcon,
  Avatar,
  formatDisplayName,
} from '@altinn/altinn-components';
import { t } from 'i18next';

import { PartyType } from '@/rtk/features/userInfoApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { UserRoles } from '../UserRoles/UserRoles';

import classes from './UserPageHeader.module.css';
import { UserPageHeaderSkeleton } from './UserPageHeaderSkeleton';
import { isSubUnit, isSubUnitByType } from '@/resources/utils/reporteeUtils';

interface UserPageHeaderProps {
  direction: 'to' | 'from';
  displayDirection?: boolean;
  displayRoles?: boolean;
}

const isOrganization = (partyType?: string) => {
  return (
    partyType === PartyType.Organization.toString() ||
    partyType?.toLowerCase() === 'organization' ||
    partyType?.toLowerCase() === 'organisasjon'
  );
};

export const UserPageHeader = ({
  direction = 'to',
  displayDirection = false,
  displayRoles = true,
}: UserPageHeaderProps) => {
  const { toParty, fromParty, isLoading: loadingPartyRepresentation } = usePartyRepresentation();
  const toPartyName = formatDisplayName({
    fullName: toParty?.name ?? '',
    type: toParty?.partyTypeName === PartyType.Organization ? 'company' : 'person',
  });
  const fromPartyName = formatDisplayName({
    fullName: fromParty?.name ?? '',
    type: fromParty?.partyTypeName === PartyType.Organization ? 'company' : 'person',
  });

  if (!toParty && !fromParty && !loadingPartyRepresentation) {
    return null;
  }

  const user = direction === 'to' ? toParty : fromParty;
  const userName = direction === 'to' ? toPartyName : fromPartyName;
  const secondaryParty = direction === 'to' ? fromParty : toParty;
  const secondaryUserName = direction === 'to' ? fromPartyName : toPartyName;

  const subHeading =
    direction === 'to'
      ? `for ${fromPartyName}`
      : t('reportee_rights_page.heading_subtitle', { name: toPartyName });

  const avatar = () => {
    if (displayDirection) {
      return (
        <div className={classes.avatar}>
          <MenuItemIcon
            icon={{
              name: userName,
              type: isOrganization(user?.partyTypeName?.toString()) ? 'company' : 'person',
              isParent: !isSubUnitByType(user?.variant?.toString()),
            }}
            size={'lg'}
          />
          <Avatar
            name={secondaryUserName}
            type={isOrganization(secondaryParty?.partyTypeName?.toString()) ? 'company' : 'person'}
            size={'lg'}
            className={classes.secondaryAvatar}
            isParent={!isSubUnitByType(secondaryParty?.variant?.toString())}
          />
        </div>
      );
    }
    return (
      <div className={classes.avatar}>
        <MenuItemIcon
          icon={{
            name: userName,
            type: isOrganization(user?.partyTypeName?.toString()) ? 'company' : 'person',
            isParent: !isSubUnitByType(user?.variant?.toString()),
          }}
          size={'lg'}
        />
      </div>
    );
  };

  return loadingPartyRepresentation ? (
    <UserPageHeaderSkeleton />
  ) : (
    <div className={classes.headingContainer}>
      {avatar()}
      <DsHeading
        level={1}
        data-size='sm'
        className={classes.heading}
      >
        {userName}
      </DsHeading>
      {subHeading && (
        <DsParagraph
          className={classes.subheading}
          data-size='xs'
        >
          {subHeading}
        </DsParagraph>
      )}
      {displayRoles && <div className={classes.userRoles}>{<UserRoles />}</div>}
    </div>
  );
};

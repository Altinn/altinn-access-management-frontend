import { DsParagraph, DsHeading, Avatar } from '@altinn/altinn-components';
import { t } from 'i18next';

import { PartyType } from '@/rtk/features/userInfoApi';
import {
  isSubUnitByType,
  formatEntityDisplayName,
  getAvatarType,
} from '@/resources/utils/reporteeUtils';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { type Party } from '@/rtk/features/lookupApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { UserRoles } from '../UserRoles/UserRoles';

import classes from './UserPageHeader.module.css';
import { UserPageHeaderSkeleton } from './UserPageHeaderSkeleton';

interface UserPageHeaderProps {
  direction: 'to' | 'from';
  displayDirection?: boolean;
  displayRoles?: boolean;
}

const getUserHeadline = (userName: string, user?: Party) => {
  const userIsOrganization = user?.partyTypeName === PartyType.Organization;
  const userIsSubUnit = isSubUnitByType(user?.unitType?.toString());
  if (userIsOrganization) {
    return userIsSubUnit
      ? `${userName} (${t('common.subunit_lowercase')})`
      : `${userName} (${t('common.mainunit_lowercase')})`;
  } else if (user?.partyTypeName === PartyType.Systemuser) {
    return `${userName} (${t('common.systemuser_lowercase')})`;
  }
  return userName;
};

export const UserPageHeader = ({
  direction = 'to',
  displayDirection = false,
  displayRoles = true,
}: UserPageHeaderProps) => {
  const { toParty, fromParty, isLoading: loadingPartyRepresentation } = usePartyRepresentation();
  const toPartyName = formatEntityDisplayName(toParty);
  const fromPartyName = formatEntityDisplayName(fromParty);
  const isSmall = useIsMobileOrSmaller();

  if (!toParty && !fromParty && !loadingPartyRepresentation) {
    return null;
  }

  const user = direction === 'to' ? toParty : fromParty;
  const userName = direction === 'to' ? toPartyName : fromPartyName;
  const secondaryParty = direction === 'to' ? fromParty : toParty;
  const secondaryUserName = direction === 'to' ? fromPartyName : toPartyName;
  const userIsSubUnit = isSubUnitByType(user?.unitType?.toString());
  const userHeadline = getUserHeadline(userName, user);

  const subHeading =
    direction === 'to'
      ? `for ${fromPartyName}`
      : t('reportee_rights_page.heading_subtitle', { name: toPartyName });

  const avatar = () => {
    return (
      <div className={classes.avatar}>
        <Avatar
          name={userName}
          type={getAvatarType(user)}
          size={isSmall ? 'md' : 'lg'}
          isDeleted={user?.isDeleted}
          isParent={!userIsSubUnit}
          className={classes.avatarInner}
        />
        {displayDirection && (
          <Avatar
            name={secondaryUserName}
            type={getAvatarType(secondaryParty)}
            size={isSmall ? 'md' : 'lg'}
            isDeleted={secondaryParty?.isDeleted}
            className={classes.secondaryAvatar}
            isParent={!isSubUnitByType(secondaryParty?.unitType?.toString())}
          />
        )}
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
        data-size={isSmall ? '2xs' : 'sm'}
        className={classes.heading}
      >
        {userHeadline}
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

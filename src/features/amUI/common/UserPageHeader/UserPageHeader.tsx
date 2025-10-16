import { DsParagraph, DsHeading, MenuItemIcon, Avatar } from '@altinn/altinn-components';
import { t } from 'i18next';

import { PartyType } from '@/rtk/features/userInfoApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { UserRoles } from '../UserRoles/UserRoles';

import classes from './UserPageHeader.module.css';
import { UserPageHeaderSkeleton } from './UserPageHeaderSkeleton';

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

  if (!toParty && !fromParty && !loadingPartyRepresentation) {
    return null;
  }

  const user = direction === 'to' ? toParty : fromParty;
  const secondaryParty = direction === 'to' ? fromParty : toParty;

  const subHeading =
    direction === 'to'
      ? `for ${fromParty?.name}`
      : t('reportee_rights_page.heading_subtitle', { name: toParty?.name });

  const avatar = () => {
    if (displayDirection) {
      return (
        <div className={classes.avatar}>
          <MenuItemIcon
            icon={{
              name: user?.name ?? '',
              type: isOrganization(user?.partyTypeName?.toString()) ? 'company' : 'person',
            }}
            size={'lg'}
          />
          <Avatar
            name={secondaryParty?.name ?? ''}
            type={isOrganization(secondaryParty?.partyTypeName?.toString()) ? 'company' : 'person'}
            size={'lg'}
            className={classes.secondaryAvatar}
          />
        </div>
      );
    }
    return (
      <div className={classes.avatar}>
        <MenuItemIcon
          icon={{
            name: user?.name ?? '',
            type: isOrganization(user?.partyTypeName?.toString()) ? 'company' : 'person',
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
        {user?.name}
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

import { Avatar, DsParagraph, DsHeading } from '@altinn/altinn-components';
import { ArrowRightIcon } from '@navikt/aksel-icons';
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

  const roles = (
    <UserRoles
      rightOwnerUuid={fromParty?.partyUuid ?? ''}
      rightHolderUuid={toParty?.partyUuid ?? ''}
    />
  );

  const avatar = () => {
    if (displayDirection) {
      return (
        <div className={classes.avatar}>
          <Avatar
            name={user?.name ?? ''}
            size={'lg'}
            type={user?.partyTypeName === PartyType.Organization ? 'company' : 'person'}
          />
          <ArrowRightIcon style={{ fontSize: '1.5rem' }} />
          <Avatar
            name={secondaryParty?.name ?? ''}
            size={'lg'}
            type={secondaryParty?.partyTypeName === PartyType.Organization ? 'company' : 'person'}
          />
        </div>
      );
    }
    return (
      <Avatar
        className={classes.avatar}
        name={user?.name || ''}
        size={'lg'}
        type={user?.partyTypeName === PartyType.Organization ? 'company' : 'person'}
      />
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
      {displayRoles && <div className={classes.userRoles}>{roles}</div>}
    </div>
  );
};

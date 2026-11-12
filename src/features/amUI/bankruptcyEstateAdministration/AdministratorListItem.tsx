import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserListItem } from '@altinn/altinn-components';

import type { PartyEntity } from '@/dataObjects/dtos/Party';
import {
  formatEntityDisplayName,
  getFormattedDateOfBirthLabel,
} from '@/resources/utils/reporteeUtils';

import { isNewUser } from '../common/isNewUser';

import { AdministratorAccess } from './AdministratorAccess';
import { RemoveAdministratorButton } from './RemoveAdministratorButton';

interface AdministratorListItemProps {
  administrator: PartyEntity;
  /*** When the administrator was added. Marks the row as new for the first hour */
  addedAt: string;
}

/*** One administrator in the list. Opens to show what the administrator has been given */
export const AdministratorListItem = ({ administrator, addedAt }: AdministratorListItemProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <UserListItem
      id={administrator.id}
      name={formatEntityDisplayName(administrator)}
      description={getFormattedDateOfBirthLabel(administrator.dateOfBirth)}
      type='person'
      size='sm'
      as='button'
      titleAs='div'
      collapsible
      expanded={isExpanded}
      onClick={() => setIsExpanded(!isExpanded)}
      {...(isNewUser(addedAt) && {
        badge: {
          label: t('client_administration_page.new_agent_tag'),
          color: 'success' as const,
          variant: 'base' as const,
        },
      })}
      controls={isExpanded && <RemoveAdministratorButton administrator={administrator} />}
    >
      {isExpanded && <AdministratorAccess />}
    </UserListItem>
  );
};

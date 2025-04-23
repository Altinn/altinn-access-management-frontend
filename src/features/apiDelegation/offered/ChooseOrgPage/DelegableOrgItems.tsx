import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { PlusCircleIcon } from '@navikt/aksel-icons';
import { DsButton } from '@altinn/altinn-components';

import classes from './ChooseOrgPage.module.css';

import { ActionBar } from '@/components';
import { addOrg } from '@/rtk/features/apiDelegation/apiDelegationSlice';
import { useAppDispatch } from '@/rtk/app/hooks';
import type { Organization } from '@/rtk/features/lookupApi';
import common from '@/resources/css/Common.module.css';
import { getButtonIconSize } from '@/resources/utils';

interface DelegatableOrgItemsProps {
  delegableOrgs: Organization[];
  setChosenItemsStatusMessage: (message: string) => void;
}

export const DelegableOrgItems = ({
  delegableOrgs,
  setChosenItemsStatusMessage,
}: DelegatableOrgItemsProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  return (
    <ul className={common.unstyledList}>
      {delegableOrgs.map((org: Organization) => {
        return (
          <li
            className={classes.actionBarWrapper}
            key={org.orgNumber}
          >
            <ActionBar
              key={org.orgNumber}
              title={org.name}
              subtitle={t('common.org_nr') + ' ' + org.orgNumber}
              headingLevel={5}
              actions={
                <DsButton
                  variant={'tertiary'}
                  color={'accent'}
                  onClick={() => {
                    dispatch(addOrg(org));
                    setChosenItemsStatusMessage(`${t('common.added')}: ${org.orgNumber}`);
                  }}
                  aria-label={t('common.add') + ' ' + org.orgNumber}
                  data-size='lg'
                  icon={true}
                >
                  <PlusCircleIcon fontSize={getButtonIconSize(false)} />
                </DsButton>
              }
              color={'neutral'}
            />
          </li>
        );
      })}
    </ul>
  );
};

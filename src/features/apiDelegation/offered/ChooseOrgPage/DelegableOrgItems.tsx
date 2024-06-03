import { Button } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { PlusCircleIcon } from '@navikt/aksel-icons';

import { ActionBar } from '@/components';
import { softAddOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import { useAppDispatch } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import common from '@/resources/css/Common.module.css';
import { getButtonIconSize } from '@/resources/utils';

import classes from './ChooseOrgPage.module.css';

interface DelegatableOrgItemsProps {
  delegableOrgs: DelegableOrg[];
  setChosenItemsStatusMessage: (message: string) => void;
}

export const DelegableOrgItems = ({
  delegableOrgs,
  setChosenItemsStatusMessage,
}: DelegatableOrgItemsProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('common');

  return (
    <ul className={common.unstyledList}>
      {delegableOrgs.map((org: DelegableOrg) => {
        return (
          <li
            className={classes.actionBarWrapper}
            key={org.orgNr}
          >
            <ActionBar
              key={org.orgNr}
              title={org.orgName}
              subtitle={t('common.org_nr') + ' ' + org.orgNr}
              headingLevel={5}
              actions={
                <Button
                  variant={'tertiary'}
                  color={'second'}
                  onClick={() => {
                    dispatch(softAddOrg(org));
                    setChosenItemsStatusMessage(`${t('common.added')}: ${org.orgName}`);
                  }}
                  aria-label={t('common.add') + ' ' + org.orgName}
                  size='large'
                  icon={true}
                >
                  <PlusCircleIcon fontSize={getButtonIconSize(false)} />
                </Button>
              }
              color={'neutral'}
            />
          </li>
        );
      })}
    </ul>
  );
};

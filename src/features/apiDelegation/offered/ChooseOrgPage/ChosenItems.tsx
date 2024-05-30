import { Button } from '@digdir/designsystemet-react';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { MinusCircleIcon } from '@navikt/aksel-icons';

import { ActionBar } from '@/components';
import type { DelegableOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import common from '@/resources/css/Common.module.css';
import { getButtonIconSize } from '@/resources/utils';

import classes from './ChooseOrgPage.module.css';

interface ChosenItemsProps {
  chosenOrgs: DelegableOrg[];
  handleSoftRemove: (org: DelegableOrg) => void;
  setChosenItemsStatusMessage: (message: string) => void;
}

export const ChosenItems = ({
  chosenOrgs,
  handleSoftRemove,
  setChosenItemsStatusMessage,
}: ChosenItemsProps) => {
  const { t } = useTranslation('common');
  return (
    <ul className={common.unstyledList}>
      {chosenOrgs.map((org: DelegableOrg, index: Key | null | undefined) => {
        return (
          <div
            className={classes.actionBarWrapper}
            key={index}
          >
            <ActionBar
              key={index}
              title={org.orgName}
              subtitle={t('common.org_nr') + ' ' + org.orgNr}
              actions={
                <Button
                  variant={'tertiary'}
                  color={'danger'}
                  onClick={() => {
                    handleSoftRemove(org);
                    setChosenItemsStatusMessage(`${t('common.removed')}: ${org.orgName}`);
                  }}
                  aria-label={t('common.remove') + ' ' + org.orgName}
                  size='large'
                  className={classes.actionButton}
                  icon={true}
                >
                  <MinusCircleIcon fontSize={getButtonIconSize(false)} />
                </Button>
              }
              color={'success'}
            />
          </div>
        );
      })}
    </ul>
  );
};

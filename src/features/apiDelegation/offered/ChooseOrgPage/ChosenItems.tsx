import { Button } from '@digdir/designsystemet-react';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { MinusCircleIcon } from '@navikt/aksel-icons';

import { ActionBar } from '@/components';
import type { Organization } from '@/rtk/features/lookup/lookupApi';
import common from '@/resources/css/Common.module.css';
import { getButtonIconSize } from '@/resources/utils';

import classes from './ChooseOrgPage.module.css';

interface ChosenItemsProps {
  chosenOrgs: Organization[];
  handleSoftRemove: (org: Organization) => void;
  setChosenItemsStatusMessage: (message: string) => void;
}

export const ChosenItems = ({
  chosenOrgs,
  handleSoftRemove,
  setChosenItemsStatusMessage,
}: ChosenItemsProps) => {
  const { t } = useTranslation();
  return (
    <ul className={common.unstyledList}>
      {chosenOrgs.map((org: Organization, index: Key | null | undefined) => {
        return (
          <div
            className={classes.actionBarWrapper}
            key={index}
          >
            <ActionBar
              key={index}
              title={org.name}
              subtitle={t('common.org_nr') + ' ' + org.orgNumber}
              actions={
                <Button
                  variant={'tertiary'}
                  color={'danger'}
                  onClick={() => {
                    handleSoftRemove(org);
                    setChosenItemsStatusMessage(`${t('common.removed')}: ${org.name}`);
                  }}
                  aria-label={t('common.remove') + ' ' + org.name}
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

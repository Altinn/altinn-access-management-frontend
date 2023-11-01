import { Chip, Heading } from '@digdir/design-system-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { getSingleRightsErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';

import type { Right } from '../RightsActionBarContent/RightsActionBarContent';

export interface RightsAlertProps {
  errorCode: string;
  rights: Right[];
  key: number;
  toggleRight: (serviceIdentifier: string, action: string) => void;
}

export const RightsAlert = ({ errorCode, rights, key, toggleRight }: RightsAlertProps) => {
  const { t } = useTranslation('common');

  return (
    <>
      <Heading
        size={'xxsmall'}
        level={5}
        key={key}
      >
        {t(`${getSingleRightsErrorCodeTextKey(errorCode)}`)}
        {rights.map((right: Right, index: number) => {
          return (
            <div key={index}>
              <Chip.Toggle
                checkmark
                selected={right.checked}
                onClick={() => {
                  toggleRight(serviceIdentifier, right.action);
                }}
              >
                {t(`common.${right.action}`)}
              </Chip.Toggle>
            </div>
          );
        })}
      </Heading>
    </>
  );
};

import { CheckmarkIcon } from '@navikt/aksel-icons';
import React from 'react';
import { DsHeading } from '@altinn/altinn-components';

import type { ConsentLanguage, ConsentRight } from '../../types';
import { transformText } from '../../utils';

import classes from './ConsentRights.module.css';

interface ConsentRightsProps {
  right: ConsentRight;
  language: keyof ConsentLanguage;
}

export const ConsentRights = ({ right, language }: ConsentRightsProps) => {
  return (
    <div className={classes.consentRight}>
      <CheckmarkIcon className={classes.consentRightIcon} />
      <div>
        <DsHeading
          level={2}
          data-size='2xs'
        >
          {right.title[language]}
        </DsHeading>
        {transformText(right.consentTextHtml[language])}
      </div>
    </div>
  );
};

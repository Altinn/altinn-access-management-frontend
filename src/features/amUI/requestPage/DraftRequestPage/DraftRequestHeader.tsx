import React from 'react';
import { Trans } from 'react-i18next';
import { DsHeading } from '@altinn/altinn-components';

interface DraftRequestHeaderProps {
  headerTextKey: string;
  toName: string;
}

export const DraftRequestHeader = ({ headerTextKey, toName }: DraftRequestHeaderProps) => {
  return (
    <DsHeading
      level={1}
      data-size='md'
    >
      <Trans
        i18nKey={headerTextKey}
        components={{ b: <strong /> }}
        values={{ to_name: toName }}
      />
    </DsHeading>
  );
};

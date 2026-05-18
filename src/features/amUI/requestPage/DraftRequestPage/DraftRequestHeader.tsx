import React, { useEffect, useRef } from 'react';
import { Trans } from 'react-i18next';
import { DsHeading } from '@altinn/altinn-components';

interface DraftRequestHeaderProps {
  headerTextKey: string;
  toName: string;
}

export const DraftRequestHeader = ({ headerTextKey, toName }: DraftRequestHeaderProps) => {
  const headerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (toName) {
      headerRef.current?.focus();
    }
  }, [toName]);

  return (
    <DsHeading
      level={1}
      data-size='md'
      ref={headerRef}
      tabIndex={-1}
    >
      <Trans
        i18nKey={headerTextKey}
        components={{ b: <strong /> }}
        values={{ to_name: toName }}
      />
    </DsHeading>
  );
};

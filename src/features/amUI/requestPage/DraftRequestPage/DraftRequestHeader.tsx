import React, { useEffect, useRef } from 'react';
import { Trans } from 'react-i18next';
import { DsHeading } from '@altinn/altinn-components';

interface DraftRequestHeaderProps {
  headerTextKey: string;
  toName: string;
  autoFocus?: boolean;
}

export const DraftRequestHeader = ({
  headerTextKey,
  toName,
  autoFocus,
}: DraftRequestHeaderProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (autoFocus) {
      headingRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <DsHeading
      level={1}
      data-size='md'
      tabIndex={-1}
      ref={headingRef}
    >
      <Trans
        i18nKey={headerTextKey}
        components={{ b: <strong /> }}
        values={{ to_name: toName }}
      />
    </DsHeading>
  );
};

import React, { useEffect, useId, useState } from 'react';
import { DsButton, DsHeading } from '@altinn/altinn-components';
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';

import classes from './CollapsibleContainer.module.css';

interface CollapsibleContainerProps {
  heading: string;
  searchString?: string;
  id?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const CollapsibleContainer = ({
  heading,
  searchString,
  id,
  defaultOpen = false,
  children,
}: CollapsibleContainerProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const contentId = useId();

  useEffect(() => {
    if (searchString && searchString.length > 0) {
      setIsOpen(true);
    }
  }, [searchString]);

  return (
    <>
      <DsHeading
        data-size='xs'
        level={2}
        id={id}
      >
        <DsButton
          className={classes.clientAdminDetails}
          variant='tertiary'
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls={contentId}
        >
          {heading}
          {isOpen ? <ChevronUpIcon aria-hidden='true' /> : <ChevronDownIcon aria-hidden='true' />}
        </DsButton>
      </DsHeading>
      <div
        id={contentId}
        className={isOpen ? classes.detailOpen : classes.detailClosed}
      >
        {children}
      </div>
    </>
  );
};

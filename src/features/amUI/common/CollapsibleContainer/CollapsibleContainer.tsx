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
  const [{ isOpen, openedBySearch }, setOpenState] = useState({
    isOpen: defaultOpen,
    openedBySearch: false,
  });
  const contentId = useId();

  // A search opens the section so matches are visible. Clearing the search closes it again, but only
  // if the search was what opened it. A manual toggle resets the flag so the user's choice wins.
  useEffect(() => {
    setOpenState((prev) => {
      if (searchString) {
        return prev.isOpen ? prev : { isOpen: true, openedBySearch: true };
      }
      return prev.openedBySearch ? { isOpen: false, openedBySearch: false } : prev;
    });
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
          onClick={() => setOpenState((prev) => ({ isOpen: !prev.isOpen, openedBySearch: false }))}
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

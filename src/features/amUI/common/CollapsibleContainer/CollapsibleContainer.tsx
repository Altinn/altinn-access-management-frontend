import React, { useEffect, useId, useRef, useState } from 'react';
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
  const openedBySearchRef = useRef(false);
  const contentId = useId();

  // A search opens the section so matches are visible. Clearing the search closes it again, but only
  // if the search was what opened it. A manual toggle resets the flag so the user's choice wins.
  useEffect(() => {
    if (searchString) {
      setIsOpen((prev) => {
        if (!prev) {
          openedBySearchRef.current = true;
        }
        return true;
      });
    } else if (openedBySearchRef.current) {
      openedBySearchRef.current = false;
      setIsOpen(false);
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
          onClick={() => {
            openedBySearchRef.current = false;
            setIsOpen((prev) => !prev);
          }}
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

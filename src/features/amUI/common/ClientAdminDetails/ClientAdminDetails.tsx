import React, { useEffect, useId, useState } from 'react';
import { DsButton, DsHeading } from '@altinn/altinn-components';
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';

import classes from './ClientAdminDetails.module.css';

interface ClientAdminDetailsProps {
  heading: string;
  searchString: string;
  children: React.ReactNode;
}

export const ClientAdminDetails = ({
  heading,
  searchString,
  children,
}: ClientAdminDetailsProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
        asChild
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

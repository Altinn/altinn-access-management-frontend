import React, { useId, useState } from 'react';
import { DsButton, DsHeading } from '@altinn/altinn-components';
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';

import classes from './ClientAdminDetails.module.css';

interface ClientAdminDetailsProps {
  heading: string;
  hasSearch: boolean;
  children: React.ReactNode;
}

export const ClientAdminDetails = ({ heading, hasSearch, children }: ClientAdminDetailsProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const showChildren = isOpen || hasSearch;
  const contentId = useId();

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
          aria-expanded={showChildren}
          aria-controls={contentId}
        >
          {heading}
          {showChildren ? (
            <ChevronUpIcon aria-hidden='true' />
          ) : (
            <ChevronDownIcon aria-hidden='true' />
          )}
        </DsButton>
      </DsHeading>
      <div
        id={contentId}
        className={showChildren ? classes.detailOpen : classes.detailClosed}
      >
        {children}
      </div>
    </>
  );
};

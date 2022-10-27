import { useState } from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionContent,
  Button,
  ButtonVariant,
  List,
  BorderStyle,
} from '@altinn/altinn-design-system';
import cn from 'classnames';

import { DeletableListItem } from './DeletableListItem';
import classes from './DelegationAccordion.module.css';

export interface DelegationAccordionProps {
  name: string;
  id: number;
  organizations: Array<{
    id: number;
    name: string;
    isSoftDelete: boolean;
  }>;
  setOrganizations: (
    id: number,
    newArray: Array<{
      id: number;
      name: string;
      isSoftDelete: boolean;
    }>,
  ) => void;
}

export const DelegationAccordion = ({ name, id, organizations, setOrganizations }: DelegationAccordionProps) => {
  const [open, setOpen] = useState(false);
  const [isAllSoftDeleted, setAllSoftDeleted] = useState(false);

  const handleAccordionClick = () => {
    setOpen(!open);
  };

  const toggleSoftDelete = (id: number) => {
    const newArray = [...organizations];
    for (const item of newArray) {
      if (item.id === id) {
        item.isSoftDelete = !item.isSoftDelete;
      }
    }
    setOrganizations(id, newArray);
    checkIsAllSoftDeleted();
  };

  const checkIsAllSoftDeleted = () => {
    for (const item of organizations) {
      if (!item.isSoftDelete) {
        setAllSoftDeleted(false);
        return;
      }
    }
    setAllSoftDeleted(true);
  };

  const softDeleteAll = () => {
    const newArray = [...organizations];
    for (const item of newArray) {
      item.isSoftDelete = true;
    }
    setOrganizations(id, newArray);
    setAllSoftDeleted(true);
    setOpen(true);
  };

  const restoreAll = () => {
    const newArray = [...organizations];
    for (const item of newArray) {
      item.isSoftDelete = false;
    }
    setOrganizations(id, newArray);
    setAllSoftDeleted(false);
  };

  const action = (
    <>
      <Button variant={ButtonVariant.Secondary}>Deleger ny virksomhet +</Button>
      {isAllSoftDeleted ? (
        <Button
          variant={ButtonVariant.Secondary}
          onClick={restoreAll}
        >
          Angre
        </Button>
      ) : (
        <Button
          variant={ButtonVariant.Cancel}
          onClick={softDeleteAll}
        >
          Slett
        </Button>
      )}
    </>
  );

  const listItems = organizations.map((b, index) => (
    <DeletableListItem
      key={index + b.id}
      itemText={b.name}
      isSoftDelete={b.isSoftDelete}
      toggleSoftDelete={() => toggleSoftDelete(b.id)}
    ></DeletableListItem>
  ));

  return (
    <Accordion
      onClick={handleAccordionClick}
      open={open}
    >
      <AccordionHeader
        subtitle={organizations.length.toString() + ' virksomheter har tilgang'}
        actions={action}
      >
        <div
          className={cn({
            [classes['delegation-accordion__accordion-header--soft-delete']]: isAllSoftDeleted,
          })}
        >
          {name}
        </div>
      </AccordionHeader>
      <AccordionContent>
        <div className={cn(classes['delegation-accordion__accordion-content'])}>
          <List borderStyle={BorderStyle.Dashed}>{listItems}</List>
        </div>
      </AccordionContent>
    </Accordion>
  );
};

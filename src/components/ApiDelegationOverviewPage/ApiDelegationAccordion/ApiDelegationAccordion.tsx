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
import classes from './ApiDelegationAccordion.module.css';

export interface DelegationAccordionProps {
  name: string;
  organizations: Array<{
    id: number;
    name: string;
    isSoftDelete: boolean;
  }>;
  setOrganizations: (
    newOrgArray: Array<{
      id: number;
      name: string;
      isSoftDelete: boolean;
    }>,
  ) => void;
}

export const ApiDelegationAccordion = ({ name, organizations, setOrganizations }: DelegationAccordionProps) => {
  const [open, setOpen] = useState(false);
  const [isAllSoftDeleted, setAllSoftDeleted] = useState(() => {
    for (const item of organizations) {
      if (!item.isSoftDelete) {
        return false;
      }
    }
    return true;
  });

  const toggleSoftDelete = (orgId: number) => {
    const newOrgArray = [...organizations];
    for (const item of newOrgArray) {
      if (item.id === orgId) {
        item.isSoftDelete = !item.isSoftDelete;
      }
    }
    setOrganizations(newOrgArray);
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
    const newOrgArray = organizations.map((item) => {
      return {
        ...item,
        isSoftDelete: true,
      };
    });
    setOrganizations(newOrgArray);
    setAllSoftDeleted(true);
    setOpen(true);
  };

  const restoreAll = () => {
    const newOrgArray = organizations.map((item) => {
      return {
        ...item,
        isSoftDelete: false,
      };
    });
    setOrganizations(newOrgArray);
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
      onClick={() => setOpen(!open)}
      open={open}
    >
      <AccordionHeader
        subtitle={organizations.length.toString() + ' virksomheter har tilgang'}
        actions={action}
      >
        <div className={cn({ [classes.accordionHeader__softDelete]: isAllSoftDeleted })}>{name}</div>
      </AccordionHeader>
      <AccordionContent>
        <div className={classes.accordionContent}>
          <List borderStyle={BorderStyle.Dashed}>{listItems}</List>
        </div>
      </AccordionContent>
    </Accordion>
  );
};

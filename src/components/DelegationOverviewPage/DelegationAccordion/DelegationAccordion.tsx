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
  buisnesses: Array<{
    id: number;
    name: string;
    isSoftDelete: boolean;
  }>;
  setBuisnesses: (
    id: number,
    newArray: Array<{
      id: number;
      name: string;
      isSoftDelete: boolean;
    }>,
  ) => void;
}

export const DelegationAccordion = ({
  name,
  id,
  buisnesses,
  setBuisnesses,
}: DelegationAccordionProps) => {
  const [open, setOpen] = useState(false);

  const handleAccordionClick = () => {
    setOpen(!open);
  };

  const toggleBuisnessState = (id: number) => {
    const newArray = [...buisnesses];
    for (const item of newArray) {
      if (item.id === id) {
        item.isSoftDelete = !item.isSoftDelete;
      }
    }
    setBuisnesses(id, newArray);
  };

  const buisnessItems = buisnesses.map((b, index) => (
    <DeletableListItem
      key={index + b.id}
      itemName={b.name}
      isSoftDelete={b.isSoftDelete}
      toggleDelState={() => toggleBuisnessState(b.id)}
    ></DeletableListItem>
  ));

  const isAllSoftDeleted = () => {
    for (const item of buisnesses) {
      if (!item.isSoftDelete) {
        return false;
      }
    }
    return true;
  };

  const softDeleteAll = () => {
    const newArray = [...buisnesses];
    for (const item of newArray) {
      item.isSoftDelete = true;
    }
    setBuisnesses(id, newArray);
  };

  const reinstateAll = () => {
    const newArray = [...buisnesses];
    for (const item of newArray) {
      item.isSoftDelete = false;
    }
    setBuisnesses(id, newArray);
  };

  const handleSoftDeleteAll = () => {
    softDeleteAll();
    setOpen(true);
  };

  const action = (
    <>
      <Button variant={ButtonVariant.Secondary}>Deleger ny virksomhet +</Button>
      {isAllSoftDeleted() ? (
        <Button variant={ButtonVariant.Secondary} onClick={reinstateAll}>
          Angre
        </Button>
      ) : (
        <Button variant={ButtonVariant.Cancel} onClick={handleSoftDeleteAll}>
          Slett
        </Button>
      )}
    </>
  );

  return (
    <Accordion onClick={handleAccordionClick} open={open}>
      <AccordionHeader
        subtitle={buisnesses.length.toString() + ' virksomheter har tilgang'}
        actions={action}
      >
        <div
          className={cn({
            [classes['delegation-accordion__accordion-header--soft-delete']]:
              isAllSoftDeleted(),
          })}
        >
          {name}
        </div>
      </AccordionHeader>
      <AccordionContent>
        <div className={cn(classes['delegation-accordion__accordion-content'])}>
          <List borderStyle={BorderStyle.Dashed}>{buisnessItems}</List>
        </div>
      </AccordionContent>
    </Accordion>
  );
};

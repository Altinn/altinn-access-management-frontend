import { useState } from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionContent,
  Button,
  ButtonColor,
  ButtonVariant,
  List,
  BorderStyle,
} from '@altinn/altinn-design-system';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { DeletableListItem } from './DeletableListItem';
import classes from './ApiDelegationAccordion.module.css';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';

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

export const ApiDelegationAccordion = ({
  name,
  organizations,
  setOrganizations,
}: DelegationAccordionProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('common');
  const overviewOrgs = useAppSelector((state) => state.overviewOrg.overviewOrgs);
  const softDeletedItems = useAppSelector((state) => state.overviewOrg.softDeletedItems);
  const dispatch = useAppDispatch();
  


  const [isAllSoftDeleted, setAllSoftDeleted] = useState(() => {
    for (const item of organizations) {
      if (!item.isSoftDelete) {
        return false;
      }
    }
    return true;
  });

  const toggleSoftDelete = (orgId: number) => {

    
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
      <Button
        variant={ButtonVariant.Quiet}
        color={ButtonColor.Primary}
        iconName={'AddCircle'}
      >
        {t('api_delegation.delegate_new_api')}
      </Button>
      {isAllSoftDeleted ? (
        <Button
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Danger}
        >
          {t('api_delegation.undo')}
        </Button>
      ) : (
        <Button
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Danger}
          iconName={'MinusCircle'}
        >
          {t('api_delegation.delete')}
        </Button>
      )}
    </>
  );

  const listItems = organizations.map((b, index) => (
    <DeletableListItem
      key={index + b.id}
      itemText={b.name}
      isSoftDelete={b.isSoftDelete}
      toggleSoftDeleteCallback={() => toggleSoftDelete(b.id)}
      softDeleteCallback={() }
    ></DeletableListItem>
  ));

  return (
    <Accordion
      onClick={() => setOpen(!open)}
      open={open}
    >
      <AccordionHeader
        subtitle={organizations.length.toString() + ' ' + t('api_delegation.api_accesses')}
        actions={action}
      >
        <div className={cn({ [classes.accordionHeader__softDelete]: isAllSoftDeleted })}>
          {name}
        </div>
      </AccordionHeader>
      <AccordionContent>
        <div className={classes.accordionContent}>
          <List borderStyle={BorderStyle.Dashed}>{listItems}</List>
        </div>
      </AccordionContent>
    </Accordion>
  );
};

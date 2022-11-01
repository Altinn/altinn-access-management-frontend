import { Accordion, AccordionHeader, AccordionContent } from '@altinn/altinn-design-system';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { fetchUsers } from '../../../rtk/features/user/userSlice';
import { ordered } from '../../../rtk/features/cake/cakeSlice';
import { ReactComponent as AddIcon } from '../../../assets/add--circle.svg';

export interface NewApiDelegationsAccordionsProps {
  headerTitle: string;
  content?: string;
}

export const NewApiDelegationsAccordion = ({
  headerTitle,
  content,
}: NewApiDelegationsAccordionsProps) => {
  const user = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const numOfCakes = useSelector((state) => state.cake.numOfCakes);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  const addToApiList = (api: any) => {
    // Redux add to
    dispatch(ordered());
    console.log('click');
  };
  const addButton = (
    <>
      <AddIcon onClick={() => addToApiList}></AddIcon>
    </>
  );
  return (
    <div>
      {user.loading && <div>Loading...</div>}
      <Accordion
        open={open}
        onClick={() => setOpen(!open)}
      >
        <AccordionHeader actions={addButton}>{headerTitle}</AccordionHeader>
        <AccordionContent>{content}</AccordionContent>
      </Accordion>
    </div>
  );
};

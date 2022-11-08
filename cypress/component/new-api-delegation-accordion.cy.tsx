import * as cypress from '@testing-library/cypress';

import {
  AccordionButtonType,
  NewApiDelegationAccordion,
} from '@/components/NewApiDelegationPage/NewApiDelegationAccordion';
import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';

describe('NewApiDelegationAccordion', () => {
  describe('AccordionHeader', () => {
    it('should call function on click for ButtonType add', () => {
      const delegableApi: DelegableApi = {
        id: '1',
        name: 'API A',
        orgName: 'Skatteetaten',
        description: 'Dette er et API for skatteetaten',
      };

      const softAdd = () => {
        cy.stub();
      };

      const softAddSpy = cy.spy(softAdd).as('softAddSpy');

      cy.mount(
        <NewApiDelegationAccordion
          delegableApi={delegableApi}
          softAddCallback={softAddSpy}
          buttonType={AccordionButtonType.Add}
        />,
      );

      cy.findByRole('button', { name: 'soft-add' }).click();
      cy.get('@softAddSpy').should('have.been.called');
    });

    it('should call function on click for ButtonType remove', () => {
      const delegableApi: DelegableApi = {
        id: '1',
        name: 'API A',
        orgName: 'Skatteetaten',
        description: 'Dette er et API for skatteetaten',
      };

      const softAdd = () => {
        cy.stub();
      };

      const softRemoveSpy = cy.spy(softAdd).as('softAddSpy');

      cy.mount(
        <NewApiDelegationAccordion
          delegableApi={delegableApi}
          softRemoveCallback={softRemoveSpy}
          buttonType={AccordionButtonType.Remove}
        />,
      );

      cy.findByRole('button', { name: 'soft-remove' }).click();
      cy.get('@softAddSpy').should('have.been.called');
    });
  });
});

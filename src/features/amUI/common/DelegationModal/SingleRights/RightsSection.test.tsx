import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RightsSection } from './RightsSection';
import { DelegationAction } from '../EditModal';
import type { ChipRight } from '../utils/rightsUtils';

// DelegationAction comes from EditModal, which drags in the loading animation.
vi.mock('lottie-react', () => ({ default: () => null }));

// Labels are the translation keys, per the convention in the other component tests. Interpolation
// values are appended so assertions can tell the variants apart.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
  Trans: ({ i18nKey, values }: { i18nKey: string; values?: Record<string, unknown> }) =>
    values ? `${i18nKey} ${JSON.stringify(values)}` : i18nKey,
}));

const right = (overrides: Partial<ChipRight> & { rightKey: string }): ChipRight => ({
  rightName: overrides.rightKey,
  delegable: true,
  checked: true,
  delegated: false,
  delegationReason: '',
  ...overrides,
});

let rights: ChipRight[];

const setRights = vi.fn();

const renderSection = (props: Partial<Parameters<typeof RightsSection>[0]> = {}) =>
  render(
    <RightsSection
      rights={rights}
      setRights={setRights}
      undelegableActions={[]}
      isDelegationCheckLoading={false}
      toName='Ola Nordmann'
      availableActions={[DelegationAction.DELEGATE]}
      delegationError={null}
      missingAccess={null}
      {...props}
    />,
  );

const expand = () => userEvent.click(screen.getByRole('button', { name: /delegation_modal\./ }));

beforeEach(() => {
  vi.clearAllMocks();
  rights = [
    right({ rightKey: 'read', rightName: 'Les' }),
    right({ rightKey: 'write', rightName: 'Skriv' }),
  ];
});

describe('RightsSection', () => {
  describe('the summary title', () => {
    it('says access to everything when every action is checked', async () => {
      renderSection();

      expect(
        screen.getByRole('button', { name: 'delegation_modal.actions.access_to_all' }),
      ).toBeInTheDocument();
    });

    it('counts the checked actions when only some are', async () => {
      rights = [right({ rightKey: 'read' }), right({ rightKey: 'write', checked: false })];
      renderSection();

      expect(
        screen.getByRole('button', {
          name: 'delegation_modal.actions.partial_access {"count":1,"total":2}',
        }),
      ).toBeInTheDocument();
    });

    it('lets the caller override the everything title', async () => {
      renderSection({ allAccessTitle: 'the whole message' });

      expect(screen.getByRole('button', { name: 'the whole message' })).toBeInTheDocument();
    });
  });

  describe('the heading', () => {
    it('says what the recipient will receive', async () => {
      renderSection();

      expect(
        screen.getByText('delegation_modal.name_will_receive {"name":"Ola Nordmann"}'),
      ).toBeInTheDocument();
    });

    it('says what they already have when there is nothing to save', async () => {
      renderSection({ hasAccessAndNoChanges: true });

      expect(
        screen.getByText('delegation_modal.name_has_the_following {"name":"Ola Nordmann"}'),
      ).toBeInTheDocument();
    });

    it('says what they are asking for on a request', async () => {
      renderSection({ availableActions: [DelegationAction.REQUEST] });

      expect(
        screen.getByText('delegation_modal.name_requests_access_to {"name":"Ola Nordmann"}'),
      ).toBeInTheDocument();
    });
  });

  describe('the description', () => {
    it('describes delegating by default', async () => {
      renderSection();
      await expand();

      expect(screen.getByText('delegation_modal.actions.action_description')).toBeInTheDocument();
    });

    it('describes requesting on a request', async () => {
      renderSection({ availableActions: [DelegationAction.REQUEST] });
      await expand();

      expect(
        screen.getByText('delegation_modal.actions.request_action_description'),
      ).toBeInTheDocument();
    });

    it('describes approving on an approval', async () => {
      renderSection({ availableActions: [DelegationAction.APPROVE] });
      await expand();

      expect(
        screen.getByText('delegation_modal.actions.approve_action_description'),
      ).toBeInTheDocument();
    });

    it('lets the caller override it, except on a request or approval', async () => {
      renderSection({ actionDescription: 'only this message' });
      await expand();

      expect(screen.getByText('only this message')).toBeInTheDocument();
    });
  });

  describe('the chips', () => {
    it('are editable only when the recipient can be delegated to', async () => {
      renderSection();
      await expand();
      await userEvent.click(screen.getByRole('checkbox', { name: 'Skriv' }));

      expect(setRights).toHaveBeenCalled();
    });

    it('do not change anything without the delegate action', async () => {
      renderSection({ availableActions: [DelegationAction.APPROVE] });
      await expand();
      await userEvent.click(screen.getByRole('checkbox', { name: 'Skriv' }));

      expect(setRights).not.toHaveBeenCalled();
    });
  });

  describe('the undelegable actions', () => {
    it('are listed when there are any', async () => {
      renderSection({ undelegableActions: ['Signer'] });
      await expand();

      expect(screen.getByText('delegation_modal.actions.cannot_give_header')).toBeInTheDocument();
      expect(screen.getByText('Signer')).toBeInTheDocument();
    });

    it('are hidden without the delegate action, since nothing is being given', async () => {
      renderSection({
        undelegableActions: ['Signer'],
        availableActions: [DelegationAction.APPROVE],
      });
      await expand();

      expect(
        screen.queryByText('delegation_modal.actions.cannot_give_header'),
      ).not.toBeInTheDocument();
    });

    it('are hidden when there are none', async () => {
      renderSection();
      await expand();

      expect(
        screen.queryByText('delegation_modal.actions.cannot_give_header'),
      ).not.toBeInTheDocument();
    });
  });

  describe('the alerts', () => {
    it('reports a failed delegation by naming the recipient', async () => {
      renderSection({ delegationError: 'delegate' });

      expect(
        screen.getByText(/delegation_modal\.technical_error_message\.all_failed/),
      ).toBeInTheDocument();
    });

    it('reports a failed revoke with its own message', async () => {
      renderSection({ delegationError: 'revoke' });

      expect(
        screen.getByText('delegation_modal.technical_error_message.revoke_failed'),
      ).toBeInTheDocument();
    });

    it('shows the missing access message when there is one', async () => {
      renderSection({ missingAccess: 'you cannot give this away' });

      expect(screen.getByText('you cannot give this away')).toBeInTheDocument();
    });
  });
});

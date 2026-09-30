import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddUserForm } from './AddUserForm';

const onSubmit = vi.fn();
const onKindChange = vi.fn();

let organization: unknown;

vi.mock('lottie-react', () => ({ default: () => null }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

vi.mock('@/rtk/features/lookupApi', () => ({
  useGetOrganizationQuery: () => organization,
}));

const form = (isSubmitting = false) => (
  <AddUserForm
    heading='add_user_heading'
    headingId='add-user-heading'
    recipientKinds={[
      { type: 'person', submitLabel: 'add_person' },
      { type: 'org', submitLabel: 'add_org' },
    ]}
    onKindChange={onKindChange}
    isSubmitting={isSubmitting}
    onSubmit={onSubmit}
  />
);

const renderForm = () => render(form());

const fillPerson = async () => {
  await userEvent.type(screen.getByLabelText('new_user_modal.person_identifier'), '20838198385');
  await userEvent.type(screen.getByLabelText('common.last_name'), 'Medaljong');
};

const submitPerson = () => userEvent.click(screen.getByRole('button', { name: 'add_person' }));

beforeEach(() => {
  vi.clearAllMocks();
  organization = { data: undefined, isFetching: false, isError: false };
});

describe('AddUserForm', () => {
  // The flow's dialog names itself by this id, so it has to land on the heading.
  it('renders the heading under the id the dialog is labelled by', () => {
    renderForm();

    expect(screen.getByRole('heading', { level: 2, name: 'add_user_heading' })).toHaveAttribute(
      'id',
      'add-user-heading',
    );
  });

  it('hands the flow the person as typed', async () => {
    renderForm();
    await fillPerson();
    await submitPerson();

    expect(onSubmit).toHaveBeenCalledWith({
      kind: 'person',
      personIdentifier: '20838198385',
      lastName: 'Medaljong',
    });
  });

  it('hands the flow the organisation its lookup found', async () => {
    organization = {
      data: { orgNumber: '310202398', name: 'Diskret Nær Tiger AS', partyUuid: 'org-uuid' },
      isFetching: false,
      isError: false,
    };
    renderForm();
    await userEvent.click(screen.getByRole('tab', { name: 'new_user_modal.organization' }));
    await userEvent.type(screen.getByLabelText('common.org_number'), '310202398');
    await userEvent.click(screen.getByRole('button', { name: 'add_org' }));

    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      kind: 'org',
      organization: { partyUuid: 'org-uuid' },
    });
  });

  // So the flow can clear an error about the recipient on the tab that was left.
  it('reports a change of tab', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('tab', { name: 'new_user_modal.organization' }));

    expect(onKindChange).toHaveBeenCalledWith('org');
  });

  // The flow decides when it is working; the form only has to respect that.
  it('cannot be submitted, nor edited, while the flow says it is submitting', async () => {
    const { rerender } = renderForm();
    await fillPerson();
    rerender(form(true));

    expect(screen.getByRole('button', { name: 'add_person' })).toBeDisabled();
    expect(screen.getByLabelText('common.last_name')).toBeDisabled();
    await submitPerson();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

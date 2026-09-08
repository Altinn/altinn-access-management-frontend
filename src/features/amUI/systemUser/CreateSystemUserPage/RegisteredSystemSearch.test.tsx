import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { RegisteredSystem } from '../types';

import { RegisteredSystemSearch } from './RegisteredSystemSearch';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    // interpolation values are appended so tests can assert on them
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${Object.values(options).join(' ')}` : key,
  }),
}));

const systems: RegisteredSystem[] = [
  {
    systemId: 'sys-1',
    name: 'Fiken regnskap',
    systemVendorOrgName: 'Fiken AS',
    systemVendorOrgNumber: '111111111',
  },
  {
    systemId: 'sys-2',
    name: 'Tripletex',
    systemVendorOrgName: 'Tripletex AS',
    systemVendorOrgNumber: '222222222',
  },
  {
    systemId: 'sys-3',
    name: 'Visma eAccounting',
    systemVendorOrgName: 'Visma Software AS',
    systemVendorOrgNumber: '333333333',
  },
];

// two systems from different vendors sharing the exact same name
const duplicateNameSystems: RegisteredSystem[] = [
  {
    systemId: 'dup-1',
    name: 'Regnskap',
    systemVendorOrgName: 'Alfa Systemer AS',
    systemVendorOrgNumber: '111111111',
  },
  {
    systemId: 'dup-2',
    name: 'Regnskap',
    systemVendorOrgName: 'Beta Systemer AS',
    systemVendorOrgNumber: '222222222',
  },
  {
    systemId: 'dup-3',
    name: 'Regnskap',
    systemVendorOrgName: 'Gamma Systemer AS',
    systemVendorOrgNumber: '333333333',
  },
];

const TestHarness = ({
  onSelectSystem,
  systems: systemsProp = systems,
}: {
  onSelectSystem?: (system: RegisteredSystem | undefined) => void;
  systems?: RegisteredSystem[];
}) => {
  const [selectedSystem, setSelectedSystem] = useState<RegisteredSystem | undefined>(undefined);
  return (
    <>
      <RegisteredSystemSearch
        label='Velg fagsystem'
        placeholder='Søk etter fagsystem'
        systems={systemsProp}
        selectedSystem={selectedSystem}
        onSelectSystem={(system) => {
          setSelectedSystem(system);
          onSelectSystem?.(system);
        }}
      />
      <button type='button'>
        Gå videre:{' '}
        {selectedSystem ? `${selectedSystem.name} (${selectedSystem.systemId})` : 'ingen'}
      </button>
    </>
  );
};

const getInput = () => screen.getByRole('combobox');

describe('RegisteredSystemSearch', () => {
  it('opens the list of systems when the search field is clicked', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    expect(getInput()).toHaveAttribute('aria-expanded', 'false');

    await user.click(getInput());

    expect(getInput()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('filters options on system name and on vendor', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(getInput());
    await user.type(getInput(), 'tripletex');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option')).toHaveTextContent('Tripletex');

    await user.clear(getInput());
    await user.type(getInput(), '333333333');
    expect(screen.getByRole('option')).toHaveTextContent('Visma eAccounting');
  });

  it('selects a system when an option is clicked', async () => {
    const user = userEvent.setup();
    const onSelectSystem = vi.fn();
    render(<TestHarness onSelectSystem={onSelectSystem} />);

    await user.click(getInput());
    await user.click(screen.getByText('Tripletex'));

    expect(onSelectSystem).toHaveBeenLastCalledWith(systems[1]);
    expect(getInput()).toHaveValue('Tripletex');
    expect(getInput()).toHaveAttribute('aria-expanded', 'false');
  });

  it('selects a system with the keyboard', async () => {
    const user = userEvent.setup();
    const onSelectSystem = vi.fn();
    render(<TestHarness onSelectSystem={onSelectSystem} />);

    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(onSelectSystem).toHaveBeenLastCalledWith(systems[1]);
    expect(getInput()).toHaveValue('Tripletex');
  });

  it('clears the selection when the search string no longer matches the selected system', async () => {
    const user = userEvent.setup();
    const onSelectSystem = vi.fn();
    render(<TestHarness onSelectSystem={onSelectSystem} />);

    await user.click(getInput());
    await user.click(screen.getByText('Tripletex'));
    expect(screen.getByRole('button', { name: /Tripletex/ })).toBeInTheDocument();

    await user.type(getInput(), 'x');

    expect(onSelectSystem).toHaveBeenLastCalledWith(undefined);
    expect(screen.getByRole('button', { name: /ingen/ })).toBeInTheDocument();
  });

  it('discards free text that is not a system when the field loses focus', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(getInput());
    await user.type(getInput(), 'et system som ikke finnes');
    expect(screen.getByText('systemuser_creationpage.no_systems_found')).toBeInTheDocument();

    await user.click(document.body);

    expect(getInput()).toHaveValue('');
    expect(screen.getByRole('button', { name: /ingen/ })).toBeInTheDocument();
  });

  it('stays open while the listbox scrollbar is dragged', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(getInput());
    const listbox = screen.getByRole('listbox');

    // dragging the scrollbar presses the listbox itself and moves focus off the input without
    // giving it to another element, which is reported as a blur with no relatedTarget
    fireEvent.mouseDown(listbox);
    fireEvent.blur(getInput(), { relatedTarget: null });

    expect(getInput()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option')).toHaveLength(3);

    // releasing the scrollbar hands the focus back, so the keyboard still works
    fireEvent.mouseUp(listbox);
    expect(getInput()).toHaveFocus();

    await user.keyboard('{ArrowDown}{Enter}');
    expect(getInput()).toHaveValue('Fiken regnskap');
  });

  it.each([
    ['no relatedTarget', null],
    ['the body as relatedTarget', document.body],
  ])('stays open when the input is blurred with %s', async (_label, relatedTarget) => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(getInput());
    fireEvent.mouseDown(screen.getByRole('listbox'));
    fireEvent.blur(getInput(), { relatedTarget });

    expect(getInput()).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes when focus moves to another element', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(getInput());
    expect(getInput()).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('button', { name: /ingen/ }));

    expect(getInput()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the list when the mouse is pressed outside the autocomplete', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(getInput());
    expect(getInput()).toHaveAttribute('aria-expanded', 'true');

    fireEvent.mouseDown(document.body);

    expect(getInput()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the list with Escape and clears the selection on a second Escape', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(getInput());
    await user.click(screen.getByText('Fiken regnskap'));
    expect(screen.getByRole('button', { name: /Fiken regnskap/ })).toBeInTheDocument();

    await user.keyboard('{ArrowDown}');
    expect(getInput()).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(getInput()).toHaveAttribute('aria-expanded', 'false');
    expect(getInput()).toHaveValue('Fiken regnskap');

    await user.keyboard('{Escape}');
    expect(getInput()).toHaveValue('');
    expect(screen.getByRole('button', { name: /ingen/ })).toBeInTheDocument();
  });

  describe('systems with identical names', () => {
    const getOptionForVendor = (vendorName: string): HTMLElement => {
      const option = screen.getByText(new RegExp(vendorName)).closest('[role="option"]');
      if (!option) {
        throw new Error(`no option found for vendor ${vendorName}`);
      }
      return option as HTMLElement;
    };

    it('selects the clicked system, not the first one with the same name', async () => {
      const user = userEvent.setup();
      const onSelectSystem = vi.fn();
      render(
        <TestHarness
          systems={duplicateNameSystems}
          onSelectSystem={onSelectSystem}
        />,
      );

      await user.click(getInput());
      await user.click(getOptionForVendor('Beta Systemer AS'));

      expect(onSelectSystem).toHaveBeenLastCalledWith(duplicateNameSystems[1]);
      expect(screen.getByRole('button', { name: /dup-2/ })).toBeInTheDocument();
    });

    it('spells out the vendor of the clicked system below the field', async () => {
      const user = userEvent.setup();
      render(<TestHarness systems={duplicateNameSystems} />);

      const selectedLineText = /systemuser_creationpage\.selected_system/;
      expect(screen.queryByText(selectedLineText)).not.toBeInTheDocument();

      await user.click(getInput());
      await user.click(getOptionForVendor('Beta Systemer AS'));

      // the line must name the vendor of the clicked system, not of the first name match
      const selectedLine = screen.getByText(selectedLineText);
      expect(selectedLine).toBeVisible();
      expect(selectedLine).toHaveTextContent('Regnskap Beta Systemer AS (222222222)');
      expect(selectedLine).not.toHaveTextContent('Alfa');
      expect(getInput()).toHaveAttribute('aria-describedby', selectedLine.id);

      // the line disappears again when the selection is cleared
      await user.keyboard('{Escape}');
      expect(screen.queryByText(selectedLineText)).not.toBeInTheDocument();
      expect(getInput()).not.toHaveAttribute('aria-describedby');
    });

    it('marks only the clicked system as selected in the list', async () => {
      const user = userEvent.setup();
      render(<TestHarness systems={duplicateNameSystems} />);

      await user.click(getInput());
      await user.click(getOptionForVendor('Gamma Systemer AS'));
      await user.click(getInput());

      const selectedOptions = screen
        .getAllByRole('option')
        .filter((option) => option.getAttribute('aria-selected') === 'true');
      expect(selectedOptions).toHaveLength(1);
      expect(selectedOptions[0]).toHaveTextContent('Gamma Systemer AS');
    });

    it('keeps the clicked system selected when the name is re-searched', async () => {
      const user = userEvent.setup();
      const onSelectSystem = vi.fn();
      render(
        <TestHarness
          systems={duplicateNameSystems}
          onSelectSystem={onSelectSystem}
        />,
      );

      await user.click(getInput());
      await user.click(getOptionForVendor('Beta Systemer AS'));
      onSelectSystem.mockClear();

      // re-typing the shared name must not re-resolve the selection to another system
      await user.clear(getInput());
      await user.type(getInput(), 'Regnskap');
      await user.click(document.body);

      expect(onSelectSystem).toHaveBeenCalledTimes(1);
      expect(onSelectSystem).toHaveBeenCalledWith(undefined);
      expect(screen.getByRole('button', { name: /ingen/ })).toBeInTheDocument();
      expect(getInput()).toHaveValue('');
    });

    it('selects the highlighted system with the keyboard, not the first name match', async () => {
      const user = userEvent.setup();
      const onSelectSystem = vi.fn();
      render(
        <TestHarness
          systems={duplicateNameSystems}
          onSelectSystem={onSelectSystem}
        />,
      );

      await user.tab();
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');

      expect(onSelectSystem).toHaveBeenLastCalledWith(duplicateNameSystems[2]);
      expect(screen.getByRole('button', { name: /dup-3/ })).toBeInTheDocument();
    });
  });
});

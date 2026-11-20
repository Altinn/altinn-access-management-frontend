import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsParagraph, DsSearch, DsSpinner } from '@altinn/altinn-components';

import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';

import type { RegisteredSystem } from '../types';

import classes from './RegisteredSystemSearch.module.css';

const isStringMatch = (inputString: string, matchString = ''): boolean => {
  return matchString.toLowerCase().indexOf(inputString.toLowerCase()) >= 0;
};

const getVendorLabel = (system: RegisteredSystem): string =>
  `${system.systemVendorOrgName} (${system.systemVendorOrgNumber})`;

interface RegisteredSystemSearchProps {
  label: string;
  placeholder: string;
  systems: RegisteredSystem[];
  selectedSystem: RegisteredSystem | undefined;
  onSelectSystem: (system: RegisteredSystem | undefined) => void;
  isLoading?: boolean;
}

/**
 * Autocomplete for picking one of the registered systems. The user can only continue with a system
 * chosen from the list: typing anything that isn't the selected system's name clears the selection.
 */
export const RegisteredSystemSearch = ({
  label,
  placeholder,
  systems,
  selectedSystem,
  onSelectSystem,
  isLoading = false,
}: RegisteredSystemSearchProps) => {
  const { t } = useTranslation();
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listboxId = `${baseId}-listbox`;
  const selectedSystemId = `${baseId}-selected`;
  const getOptionId = (systemId: string): string => `${baseId}-option-${systemId}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const [searchString, setSearchString] = useState<string>(selectedSystem?.name ?? '');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const filteredSystems = useMemo(() => {
    const query = searchString.trim();
    // showing the selected system's name isn't a search: keep the full list available
    if (!query || query === selectedSystem?.name) {
      return systems;
    }
    return systems.filter(
      (system) => isStringMatch(query, system.name) || isStringMatch(query, getVendorLabel(system)),
    );
  }, [systems, searchString, selectedSystem]);

  // keep the highlighted option in view when navigating with the keyboard
  useEffect(() => {
    if (!isOpen || activeIndex < 0) {
      return;
    }
    const activeSystem = filteredSystems[activeIndex];
    if (activeSystem) {
      listboxRef.current
        ?.querySelector(`#${CSS.escape(getOptionId(activeSystem.systemId))}`)
        ?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, activeIndex, filteredSystems]);

  const openList = (index: number): void => {
    setIsOpen(true);
    setActiveIndex(index);
  };

  const closeList = (): void => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const selectSystem = (system: RegisteredSystem): void => {
    onSelectSystem(system);
    setSearchString(system.name);
    closeList();
    inputRef.current?.focus();
  };

  const clearSelection = (): void => {
    onSelectSystem(undefined);
    setSearchString('');
    closeList();
    inputRef.current?.focus();
  };

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newSearchString = event.target.value;
    setSearchString(newSearchString);
    setIsOpen(true);
    setActiveIndex(-1);
    // a system stays selected only as long as the search field shows its name
    if (selectedSystem && newSearchString !== selectedSystem.name) {
      onSelectSystem(undefined);
    }
  };

  const moveActiveIndex = (step: number): void => {
    if (filteredSystems.length === 0) {
      return;
    }
    if (!isOpen) {
      openList(step > 0 ? 0 : filteredSystems.length - 1);
      return;
    }
    const nextIndex = activeIndex + step;
    if (nextIndex < 0) {
      setActiveIndex(filteredSystems.length - 1);
    } else if (nextIndex >= filteredSystems.length) {
      setActiveIndex(0);
    } else {
      setActiveIndex(nextIndex);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActiveIndex(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActiveIndex(-1);
        break;
      case 'Home':
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case 'End':
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(filteredSystems.length - 1);
        }
        break;
      case 'Enter': {
        const activeSystem = isOpen ? filteredSystems[activeIndex] : undefined;
        if (activeSystem) {
          event.preventDefault();
          selectSystem(activeSystem);
        }
        break;
      }
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          closeList();
        } else if (searchString) {
          clearSelection();
        }
        break;
      case 'Tab':
        closeList();
        break;
    }
  };

  const closeAndResetSearchString = (): void => {
    closeList();
    // discard free text that doesn't match a system, so the field never shows an invalid choice
    setSearchString(selectedSystem?.name ?? '');
  };

  const onContainerBlur = (event: React.FocusEvent<HTMLDivElement>): void => {
    // Focus can leave the input without landing on a real element - dragging the scrollbar of the
    // listbox does exactly that, and browsers disagree on what they report: no relatedTarget at
    // all, or the body. Closing on those would close the list mid-drag, so only a focus move to
    // another real element closes it here. Clicks outside are handled by the document listener.
    const newlyFocused = event.relatedTarget;
    const isRealElement =
      !!newlyFocused && newlyFocused !== document.body && newlyFocused !== document.documentElement;
    if (!isRealElement || event.currentTarget.contains(newlyFocused)) {
      return;
    }
    closeAndResetSearchString();
  };

  // close on any mousedown outside the autocomplete, including on elements that can't take focus
  useEffect(() => {
    const isInsideAutocomplete = (event: MouseEvent): boolean => {
      if (containerRef.current?.contains(event.target as Node)) {
        return true;
      }
      // A scrollbar press isn't always reported against the element it belongs to, so fall back to
      // hit-testing the pointer against the field and the open listbox (whose box includes its
      // scrollbar). Without this, dragging the listbox scrollbar reads as a click outside.
      const listbox = listboxRef.current;
      return [containerRef.current, listbox?.hidden ? null : listbox].some((element) => {
        if (!element) {
          return false;
        }
        const { left, right, top, bottom, width, height } = element.getBoundingClientRect();
        if (width === 0 || height === 0) {
          return false; // nothing rendered to hit-test against
        }
        return (
          event.clientX >= left &&
          event.clientX <= right &&
          event.clientY >= top &&
          event.clientY <= bottom
        );
      });
    };

    const onDocumentMouseDown = (event: MouseEvent): void => {
      if (!isInsideAutocomplete(event)) {
        closeAndResetSearchString();
      }
    };
    document.addEventListener('mousedown', onDocumentMouseDown, true);
    return () => document.removeEventListener('mousedown', onDocumentMouseDown, true);
  }, [selectedSystem]);

  const activeSystem = isOpen ? filteredSystems[activeIndex] : undefined;
  const isSearching = searchString.trim() !== '' && searchString.trim() !== selectedSystem?.name;

  return (
    <div
      ref={containerRef}
      className={classes.container}
      onBlur={onContainerBlur}
    >
      <DsParagraph
        asChild
        data-size='sm'
      >
        <label
          className={classes.label}
          htmlFor={inputId}
        >
          {label}
        </label>
      </DsParagraph>
      {/* anchors the listbox to the search field, so the selected-system line below doesn't move it */}
      <div className={classes.field}>
        <DsSearch>
          <DsSearch.Input
            ref={inputRef}
            id={inputId}
            role='combobox'
            autoComplete='off'
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete='list'
            aria-activedescendant={activeSystem ? getOptionId(activeSystem.systemId) : undefined}
            aria-describedby={selectedSystem ? selectedSystemId : undefined}
            placeholder={placeholder}
            value={searchString}
            onChange={onSearchChange}
            onKeyDown={onKeyDown}
            onClick={() => openList(activeIndex)}
          />
          {searchString && <DsSearch.Clear onClick={clearSelection} />}
        </DsSearch>
        <div
          ref={listboxRef}
          id={listboxId}
          role='listbox'
          aria-label={label}
          className={classes.listbox}
          hidden={!isOpen}
          // a scrollbar drag leaves the focus on nothing; hand it back so the keyboard keeps working
          onMouseUp={() => {
            if (!containerRef.current?.contains(document.activeElement)) {
              inputRef.current?.focus();
            }
          }}
        >
          {isLoading && (
            <div className={classes.message}>
              <DsSpinner
                data-size='xs'
                aria-label={t('systemuser_creationpage.loading_systems')}
              />
              <DsParagraph data-size='sm'>
                {t('systemuser_creationpage.loading_systems')}
              </DsParagraph>
            </div>
          )}
          {!isLoading && filteredSystems.length === 0 && (
            <DsParagraph
              data-size='sm'
              className={classes.message}
            >
              {t('systemuser_creationpage.no_systems_found')}
            </DsParagraph>
          )}
          {!isLoading &&
            filteredSystems.map((system, index) => (
              <div
                key={system.systemId}
                id={getOptionId(system.systemId)}
                role='option'
                aria-selected={system.systemId === selectedSystem?.systemId}
                className={
                  index === activeIndex ? `${classes.option} ${classes.active}` : classes.option
                }
                onMouseMove={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()} // keep the focus in the input
                onClick={() => selectSystem(system)}
              >
                <DsParagraph data-size='sm'>{system.name}</DsParagraph>
                <DsParagraph
                  data-size='xs'
                  className={classes.optionDescription}
                >
                  {getVendorLabel(system)}
                </DsParagraph>
              </div>
            ))}
        </div>
      </div>
      {/* several systems can share the same name, so spell out which one is selected */}
      {selectedSystem && (
        <DsParagraph
          id={selectedSystemId}
          data-size='xs'
          className={classes.selectedSystem}
        >
          {t('systemuser_creationpage.selected_system', {
            systemName: selectedSystem.name,
            vendor: getVendorLabel(selectedSystem),
          })}
        </DsParagraph>
      )}
      <StatusMessageForScreenReader>
        {isOpen && isSearching && !isLoading
          ? t('systemuser_creationpage.search_hits', { count: filteredSystems.length })
          : ''}
      </StatusMessageForScreenReader>
    </div>
  );
};

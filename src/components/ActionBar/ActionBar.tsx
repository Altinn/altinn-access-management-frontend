import * as React from 'react';
import { useId, useState, forwardRef, useEffect } from 'react';

import type { ClickHandler } from './Context';
import { ActionBarContext } from './Context';
import { ActionBarContent } from './ActionBarContent';
import { ActionBarHeader } from './ActionBarHeader';

export interface ActionBarProps {
  /** Additional actions to be displayed on the right side of the ActionBar. */
  actions?: React.ReactNode;

  /** Additional text to be displayed on the right side of the header of the ActionBar. */
  additionalText?: React.ReactNode;

  /** The content to be displayed as expandable content inside the ActionBar. */
  children?: React.ReactNode;

  /** The color variant of the ActionBar. */
  color?: 'light' | 'dark' | 'neutral' | 'warning' | 'success' | 'danger';

  /** The size variant of the ActionBar. */
  size?: 'small' | 'medium' | 'large';

  /** Heading level. Use this to make sure the heading is correct according to you page heading levels */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;

  /** The click event handler for the ActionBar header. */
  onClick?: ClickHandler;

  /** Specifies whether the ActionBar is open or closed. */
  open?: boolean;

  /**  Defaults the ActionBar to open if not controlled */
  defaultOpen?: boolean;

  /** The subtitle to be displayed in the header of the ActionBar. */
  subtitle?: React.ReactNode;

  /** The title to be displayed in the header of the ActionBar. */
  title?: React.ReactNode;
}

/**
 * @component
 * @example
 * <ActionBar
 *    actions={
 *      <><button onClick={handleActionBarClick}>Action 1</button>
 *      <button onClick={handleActionBarClick}>Action 1</button></>
 *    }
 *    additionalText=<div>"Additional Text"</div>
 *    color="neutral"
 *    size="medium"
 *    headingLevel={1}
 *    onClick={handleActionBarClick}
 *    open={openState}
 *    subtitle={<div>"Subtitle"</div>}
 *    title={<div>"Title"</div>}
 *   >
 *      <div>Content goes here</div>
 * </ActionBar>
 *
 * @property {React.ReactNode} [actions] - Additional actions to be displayed on the right side of the header of the ActionBar.
 * @property {React.ReactNode} [additionalText] - Additional text to be displayed in the header of the ActionBar.
 * @property {React.ReactNode} [children] - The content to be displayed as expandable content inside the ActionBar.
 * @property {'light' | 'neutral' | 'warning' | 'success' | 'danger'} [color='neutral'] - The color variant of the ActionBar.
 * @property {'small' | 'medium' | 'large'} [size='medium'] - The size variant of the ActionBar.
 * @property {1 | 2 | 3 | 4 | 5 | 6} [headingLevel] - The headingLevel ActionBar title.
 * @property {ClickHandler} [onClick] - The click event handler for the ActionBar header.
 * @property {boolean} [open] - Specifies whether the ActionBar is open or closed.
 * @property {boolean} [defaultOpen=false] - Defaults the ActionBar to open if not controlled.
 * @property {React.ReactNode} [subtitle] - The subtitle to be displayed in the header of the ActionBar.
 * @property {React.ReactNode} [title] - The title to be displayed in the header of the ActionBar.
 * @returns {React.ReactNode} The rendered ActionBar component.
 */

export const ActionBar = forwardRef<HTMLDivElement, ActionBarProps>(
  (
    {
      actions,
      additionalText,
      children,
      color = 'neutral',
      size = 'medium',
      onClick,
      open,
      defaultOpen = false,
      subtitle,
      title,
      headingLevel,
    },
    ref,
  ) => {
    const headerId = useId();
    const contentId = useId();

    const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
    const isOpen = open ?? internalOpen;

    // Update internalopen if there are external changes to default
    useEffect(() => {
      setInternalOpen(defaultOpen);
    }, [defaultOpen]);

    let toggleOpen: ClickHandler | undefined;
    if (!children) {
      toggleOpen = undefined;
    } else {
      toggleOpen = () => {
        onClick !== undefined ? onClick() : setInternalOpen((openState) => !openState);
      };
    }

    return (
      <div ref={ref}>
        <ActionBarContext.Provider
          value={{
            toggleOpen,
            open: isOpen,
            headerId,
            contentId,
            color,
            size,
          }}
        >
          <ActionBarHeader
            title={title}
            subtitle={subtitle}
            additionalText={additionalText}
            headingLevel={headingLevel}
            actions={actions}
          ></ActionBarHeader>
          <ActionBarContent>{children}</ActionBarContent>
        </ActionBarContext.Provider>
      </div>
    );
  },
);

ActionBar.displayName = 'ActionBar';

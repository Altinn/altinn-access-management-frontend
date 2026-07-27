import { createContext, useContext, useState, type ReactNode } from 'react';
import { DsBadge, DsTabs } from '@altinn/altinn-components';

import classes from './AmTabs.module.css';

// ─── Context ─────────────────────────────────────────────────────────────────

interface AmTabsContextValue {
  currentValue: string;
}

const AmTabsContext = createContext<AmTabsContextValue>({ currentValue: '' });

// ─── AmTabs (root) ───────────────────────────────────────────────────────────

type DsTabsProps = React.ComponentProps<typeof DsTabs>;

interface AmTabsProps extends Omit<DsTabsProps, 'data-size'> {
  'data-size'?: DsTabsProps['data-size'];
}

const AmTabsRoot = ({
  value: valueProp,
  defaultValue,
  onChange,
  children,
  'data-size': dataSize = 'sm',
  ...rest
}: AmTabsProps) => {
  const [internalValue, setInternalValue] = useState<string>(defaultValue ?? '');
  const currentValue = valueProp ?? internalValue;

  const handleChange = (v: string) => {
    setInternalValue(v);
    onChange?.(v);
  };

  return (
    <AmTabsContext.Provider value={{ currentValue }}>
      <DsTabs
        data-size={dataSize}
        value={currentValue}
        onChange={handleChange}
        defaultValue={defaultValue}
        {...rest}
      >
        {children}
      </DsTabs>
    </AmTabsContext.Provider>
  );
};

// ─── AmTabs.List ─────────────────────────────────────────────────────────────

type DsTabsListProps = React.ComponentProps<typeof DsTabs.List>;

interface AmTabsListProps extends DsTabsListProps {
  className?: string;
}

const AmTabsList = ({ className, ...rest }: AmTabsListProps) => (
  <DsTabs.List
    className={[classes.tabList, className].filter(Boolean).join(' ')}
    {...rest}
  />
);

// ─── AmTabs.Tab ──────────────────────────────────────────────────────────────

type DsTabsTabProps = React.ComponentProps<typeof DsTabs.Tab>;

interface AmTabsTabProps extends Omit<DsTabsTabProps, 'children'> {
  label: string;
  icon?: ReactNode;
  badge?: number;
}

const AmTabsTab = ({ label, icon, badge, value, ...rest }: AmTabsTabProps) => {
  const { currentValue } = useContext(AmTabsContext);
  const isActive = currentValue === value;

  return (
    <DsTabs.Tab
      value={value}
      {...rest}
    >
      <span className={classes.tabLabel}>
        <span className={classes.tabIconBadge}>
          {icon}
          {badge !== undefined && (
            <DsBadge
              data-size='sm'
              color={isActive ? 'accent' : 'neutral'}
              count={badge}
              maxCount={99}
            />
          )}
        </span>
        {label}
      </span>
    </DsTabs.Tab>
  );
};

// ─── AmTabs.Panel ────────────────────────────────────────────────────────────

const AmTabsPanel = DsTabs.Panel;

// ─── Compound export ─────────────────────────────────────────────────────────

export const AmTabs = Object.assign(AmTabsRoot, {
  List: AmTabsList,
  Tab: AmTabsTab,
  Panel: AmTabsPanel,
});

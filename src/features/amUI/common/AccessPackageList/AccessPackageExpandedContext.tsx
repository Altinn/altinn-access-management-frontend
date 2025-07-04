import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

/**
 * AccessPackageExpandedContext.tsx
 *
 * This file provides a context and utility hooks for managing the expanded state of areas
 * in the Access Package List. It allows components to share the expanded state via context
 * or fall back to a local state if the context is not available.
 */

interface AccessPackageContextValue {
  /**
   * Toggles the expanded state of a specific area by its ID.
   * @param areaId - The ID of the area to toggle.
   */
  toggleExpandedArea: (areaId: string) => void;

  /**
   * Checks if a specific area is expanded.
   * @param areaId - The ID of the area to check.
   * @returns `true` if the area is expanded, otherwise `false`.
   */
  isExpanded: (areaId: string) => boolean;

  /**
   * Closes all areas by resetting the expanded state.
   */
  closeAllAreas: () => void;
}

/**
 * React Context for managing the expanded state of areas.
 * Components can use this context to share the expanded state across the component tree.
 */
export const AccessPackageContext = createContext<AccessPackageContextValue | null>(null);

/**
 * Hook to manage the expanded state of areas.
 *
 * @returns An object with `toggleExpandedArea` and `isExpanded` functions.
 */
const useAreaExpandedState = () => {
  const [expandedAreas, setExpandedAreas] = useState<string[]>([]);

  const toggleExpandedArea = (areaId: string) => {
    if (expandedAreas.some((id) => id === areaId)) {
      const newExpandedState = expandedAreas.filter((id) => id !== areaId);
      setExpandedAreas(newExpandedState);
    } else {
      setExpandedAreas([...expandedAreas, areaId]);
    }
  };

  const closeAllAreas = () => {
    setExpandedAreas([]);
  };

  const isExpanded = (areaId: string) => expandedAreas.some((id) => id === areaId);

  return { toggleExpandedArea, isExpanded, closeAllAreas };
};

/**
 * Hook to use the expanded state from the context if available.
 * Falls back to local state if the context is not provided.
 *
 * @returns An object with `toggleExpandedArea` and `isExpanded` functions.
 */
export const useAreaExpandedContextOrLocal = () => {
  const context = useContext(AccessPackageContext);
  if (!context) {
    return useAreaExpandedState();
  }
  return context;
};

/**
 * Context Provider for the expanded state of areas.
 * Wrap your component tree with this provider to share the expanded state via context.
 *
 * @param children - The child components that will have access to the context.
 * @returns A React component that provides the context to its children.
 */
export const AreaExpandedStateProvider = ({ children }: { children: ReactNode }) => {
  const { toggleExpandedArea, isExpanded, closeAllAreas } = useAreaExpandedState();

  return (
    <AccessPackageContext.Provider value={{ toggleExpandedArea, isExpanded, closeAllAreas }}>
      {children}
    </AccessPackageContext.Provider>
  );
};

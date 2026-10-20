import { useState } from 'react';

export interface AreaExpandedState {
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
 * Hook to manage the expanded state of areas in the access package list.
 */
export const useAreaExpandedState = (): AreaExpandedState => {
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

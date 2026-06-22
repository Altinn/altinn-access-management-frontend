import { createContext, useContext, useEffect, useState } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ActionError } from '@/resources/hooks/useActionError';
import { useActionError } from '@/resources/hooks/useActionError';
export interface DelegationModalProps {
  children: React.ReactNode;
}

// Shared id for whichever heading is currently the modal's title (search view or info view).
// Referenced by the dialog's aria-labelledby so it has a stable accessible name, instead of
// screen readers falling back to nearby text (e.g. the package description) on every focus change.
export const delegationModalTitleId = 'delegation-modal-title';

interface DelegationModalContextProps {
  resourceToView: ServiceResource | undefined;
  packageToView: AccessPackage | undefined;
  infoView: boolean;
  filters: string[];
  searchString: string;
  currentPage: number;
  setInfoView: React.Dispatch<React.SetStateAction<boolean>>;
  setFilters: React.Dispatch<React.SetStateAction<string[]>>;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setResourceToView: React.Dispatch<React.SetStateAction<ServiceResource | undefined>>;
  setPackageToView: React.Dispatch<React.SetStateAction<AccessPackage | undefined>>;
  onSelection: (resource?: ServiceResource, accessPackage?: AccessPackage) => void;
  expandedAreas: string[];
  toggleExpanded: (value: boolean, id: string) => void;
  actionError: ActionError | null;
  setActionError: (error: ActionError | null) => void;
  includeExpiredResources: boolean;
  setIncludeExpiredResources: React.Dispatch<React.SetStateAction<boolean>>;
  actionSuccess: boolean;
  setActionSuccess: (value: boolean) => void;
  reset: () => void;
}

const DelegationModalContext = createContext<DelegationModalContextProps | undefined>(undefined);

export const DelegationModalProvider = ({ children }: DelegationModalProps) => {
  const [filters, setFilters] = useState<string[]>([]);
  const [searchString, setSearchString] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [resourceToView, setResourceToView] = useState<ServiceResource | undefined>(undefined);
  const [packageToView, setPackageToView] = useState<AccessPackage | undefined>(undefined);
  const [infoView, setInfoView] = useState(false);
  const [expandedAreas, setExpandedAreas] = useState<string[]>([]);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [includeExpiredResources, setIncludeExpiredResources] = useState(false);
  const { error: actionError, setError: setActionError } = useActionError();

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, includeExpiredResources]);

  const toggleExpanded = (value: boolean, id: string) => {
    if (value) {
      setExpandedAreas([...expandedAreas, id]);
    } else {
      setExpandedAreas(expandedAreas.filter((areaId) => areaId !== id));
    }
  };

  const onSelection = (resource?: ServiceResource, accessPackage?: AccessPackage) => {
    if (resource) {
      setInfoView(true);
      setResourceToView(resource);
    } else if (accessPackage) {
      setInfoView(true);
      setPackageToView(accessPackage);
    }
  };

  const reset = () => {
    setActionError(null);
    setActionSuccess(false);
    setCurrentPage(1);
    setResourceToView(undefined);
    setPackageToView(undefined);
    setExpandedAreas([]);
    setInfoView(false);
    setFilters([]);
    setSearchString('');
    setIncludeExpiredResources(false);
  };

  return (
    <DelegationModalContext.Provider
      value={{
        resourceToView,
        packageToView,
        infoView,
        setInfoView,
        onSelection,
        filters,
        setFilters,
        searchString,
        setSearchString,
        currentPage,
        setCurrentPage,
        setResourceToView,
        setPackageToView,
        expandedAreas,
        toggleExpanded,
        actionError,
        setActionError,
        includeExpiredResources,
        setIncludeExpiredResources,
        actionSuccess,
        setActionSuccess,
        reset,
      }}
    >
      {children}
    </DelegationModalContext.Provider>
  );
};

export const useDelegationModalContext = (): DelegationModalContextProps => {
  const context = useContext(DelegationModalContext);
  if (!context) {
    throw new Error('useDelegationModalContext must be used within a DelegationModalProvider');
  }
  return context;
};

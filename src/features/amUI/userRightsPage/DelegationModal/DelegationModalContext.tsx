import React, { createContext, useContext, useState } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
export interface DelegationModalProps {
  children: React.ReactNode;
}

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
}

const DelegationModalContext = createContext<DelegationModalContextProps | undefined>(undefined);

export const DelegationModalProvider: React.FC<DelegationModalProps> = ({ children }) => {
  const [filters, setFilters] = useState<string[]>([]);
  const [searchString, setSearchString] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [resourceToView, setResourceToView] = useState<ServiceResource | undefined>(undefined);
  const [packageToView, setPackageToView] = useState<AccessPackage | undefined>(undefined);
  const [infoView, setInfoView] = useState(false);

  const onSelection = (resource?: ServiceResource, accessPackage?: AccessPackage) => {
    if (resource) {
      setInfoView(true);
      setResourceToView(resource);
    } else if (accessPackage) {
      setInfoView(true);
      setPackageToView(accessPackage);
    }
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

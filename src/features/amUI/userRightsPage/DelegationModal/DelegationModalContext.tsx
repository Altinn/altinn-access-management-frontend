import React, { createContext, useContext, useState } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

export interface DelegationModalProps {
  children: React.ReactNode;
}

interface DelegationModalContextProps {
  resourceToView: ServiceResource | undefined;
  infoView: boolean;
  filters: string[];
  searchString: string;
  currentPage: number;
  setInfoView: React.Dispatch<React.SetStateAction<boolean>>;
  setFilters: React.Dispatch<React.SetStateAction<string[]>>;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setResourceToView: React.Dispatch<React.SetStateAction<ServiceResource | undefined>>;
  onSelection: (resource: ServiceResource) => void;
}

const DelegationModalContext = createContext<DelegationModalContextProps | undefined>(undefined);

export const DelegationModalProvider: React.FC<DelegationModalProps> = ({ children }) => {
  const [filters, setFilters] = useState<string[]>([]);
  const [searchString, setSearchString] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [resourceToView, setResourceToView] = useState<ServiceResource | undefined>(undefined);
  const [infoView, setInfoView] = useState(false);

  const onSelection = (resource: ServiceResource) => {
    setInfoView(true);
    setResourceToView(resource);
  };

  return (
    <DelegationModalContext.Provider
      value={{
        resourceToView,
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

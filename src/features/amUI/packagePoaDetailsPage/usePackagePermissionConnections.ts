import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { Connection } from '@/rtk/features/connectionApi';
import { usePermissionConnections } from '../common/PermissionConnections/usePermissionConnections';

export const usePackagePermissionConnections = (accessPackage?: AccessPackage): Connection[] => {
  return usePermissionConnections(accessPackage?.permissions);
};
export default usePackagePermissionConnections;

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import * as requestApiModule from '@/rtk/features/requestApi';
import * as singleRightsModule from '@/rtk/features/singleRights/singleRightsApi';
import * as partyRepModule from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import * as delegationCheckModule from '../../common/DelegationCheck/AccessPackageDelegationCheckContext';
import * as altinnComponents from '@altinn/altinn-components';
import * as i18nModule from 'react-i18next';

import { useRequestReview } from './useRequestReview';
import type { Request } from '../types';
import type { EnrichedResourceRequest, EnrichedPackageRequest } from '@/rtk/features/requestApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

vi.mock('@altinn/altinn-components', () => ({ useSnackbar: vi.fn() }));
vi.mock('react-i18next', () => ({ useTranslation: vi.fn() }));
vi.mock('../../common/PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: vi.fn(),
}));
vi.mock('../../common/DelegationCheck/AccessPackageDelegationCheckContext', () => ({
  useAccessPackageDelegationCheck: vi.fn(),
}));
vi.mock('@/rtk/features/requestApi', () => ({
  useApproveRequestMutation: vi.fn(),
  useRejectRequestMutation: vi.fn(),
  useGetEnrichedReceivedResourceRequestsQuery: vi.fn(),
  useGetEnrichedReceivedPackageRequestsQuery: vi.fn(),
}));
vi.mock('@/rtk/features/singleRights/singleRightsApi', () => ({
  useLazyDelegationCheckQuery: vi.fn(),
}));

// --- Constants ---

const PARTY_UUID = 'acting-party-uuid';
const FROM_PARTY_UUID = 'from-party-uuid';
const LAST_UPDATED = '2024-01-15T12:00:00Z';

const mockRequest: Request = {
  id: 'mock-request',
  type: 'accessrequest',
  createdDate: '2024-01-01',
  displayPartyName: 'Test Person',
  displayPartyType: 'person',
  partyUuid: FROM_PARTY_UUID,
};

// --- Test data factories ---

const makeResourceReq = (requestId: string, identifier: string): EnrichedResourceRequest =>
  ({
    id: requestId,
    lastUpdated: LAST_UPDATED,
    resource: { identifier },
  }) as EnrichedResourceRequest;

const makePackageReq = (requestId: string, packageId: string): EnrichedPackageRequest =>
  ({
    id: requestId,
    lastUpdated: LAST_UPDATED,
    package: { id: packageId },
  }) as EnrichedPackageRequest;

// --- Tests ---

describe('useRequestReview', () => {
  const mockOpenSnackbar = vi.fn();
  const mockCanDelegatePackage = vi.fn();
  const mockApproveFn = vi.fn();
  const mockRejectFn = vi.fn();
  const mockLazyCheck = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(altinnComponents.useSnackbar).mockReturnValue({
      openSnackbar: mockOpenSnackbar,
    } as any);
    vi.mocked(i18nModule.useTranslation).mockReturnValue({ t: (k: string) => k } as any);
    vi.mocked(partyRepModule.usePartyRepresentation).mockReturnValue({
      actingParty: { partyUuid: PARTY_UUID },
    } as any);
    vi.mocked(delegationCheckModule.useAccessPackageDelegationCheck).mockReturnValue({
      canDelegatePackage: mockCanDelegatePackage,
    } as any);

    mockApproveFn.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ lastUpdated: LAST_UPDATED }),
    });
    mockRejectFn.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ lastUpdated: LAST_UPDATED }),
    });
    mockLazyCheck.mockReturnValue({ unwrap: vi.fn().mockResolvedValue([]) });
    mockCanDelegatePackage.mockReturnValue(undefined);

    vi.mocked(requestApiModule.useApproveRequestMutation).mockReturnValue([mockApproveFn] as any);
    vi.mocked(requestApiModule.useRejectRequestMutation).mockReturnValue([mockRejectFn] as any);
    vi.mocked(singleRightsModule.useLazyDelegationCheckQuery).mockReturnValue([
      mockLazyCheck,
    ] as any);
    vi.mocked(requestApiModule.useGetEnrichedReceivedResourceRequestsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    } as any);
    vi.mocked(requestApiModule.useGetEnrichedReceivedPackageRequestsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    } as any);
  });

  /** Renders the hook with the given snapshot data already available from the API. */
  const renderWithData = (
    resources: EnrichedResourceRequest[] = [],
    packages: EnrichedPackageRequest[] = [],
  ) => {
    vi.mocked(requestApiModule.useGetEnrichedReceivedResourceRequestsQuery).mockReturnValue({
      data: resources,
      isLoading: false,
      isFetching: false,
    } as any);
    vi.mocked(requestApiModule.useGetEnrichedReceivedPackageRequestsQuery).mockReturnValue({
      data: packages,
      isLoading: false,
      isFetching: false,
    } as any);
    return renderHook(() => useRequestReview(mockRequest, mockOnClose));
  };

  // ---------------------------------------------------------------------------

  describe('snapshot capture', () => {
    it('starts with an empty snapshot when there is no data', () => {
      const { result } = renderHook(() => useRequestReview(mockRequest, mockOnClose));
      expect(result.current.snapshotResources).toHaveLength(0);
      expect(result.current.snapshotPackages).toHaveLength(0);
    });

    it('captures resource requests into the snapshot when data arrives', async () => {
      const { result } = renderWithData([makeResourceReq('req-r1', 'resource-1')]);
      await act(async () => {});
      expect(result.current.snapshotResources).toHaveLength(1);
      expect(result.current.snapshotResources[0].identifier).toBe('resource-1');
    });

    it('captures package requests into the snapshot when data arrives', async () => {
      const { result } = renderWithData([], [makePackageReq('req-p1', 'package-1')]);
      await act(async () => {});
      expect(result.current.snapshotPackages).toHaveLength(1);
      expect(result.current.snapshotPackages[0].id).toBe('package-1');
    });
  });

  // ---------------------------------------------------------------------------

  describe('cannotApprove', () => {
    it('returns false for a package when canDelegatePackage returns undefined (no data yet)', () => {
      mockCanDelegatePackage.mockReturnValue(undefined);
      const { result } = renderHook(() => useRequestReview(mockRequest, mockOnClose));
      expect(result.current.cannotApprove({ packageId: 'pkg-1' })).toBe(false);
    });

    it('returns false for a package when canDelegatePackage result is true', () => {
      mockCanDelegatePackage.mockReturnValue({ result: true, reasons: [] });
      const { result } = renderHook(() => useRequestReview(mockRequest, mockOnClose));
      expect(result.current.cannotApprove({ packageId: 'pkg-1' })).toBe(false);
    });

    it('returns true for a package when canDelegatePackage result is false', () => {
      mockCanDelegatePackage.mockReturnValue({ result: false, reasons: [] });
      const { result } = renderHook(() => useRequestReview(mockRequest, mockOnClose));
      expect(result.current.cannotApprove({ packageId: 'pkg-1' })).toBe(true);
    });

    it('returns false for a resource when no delegation checks have loaded', () => {
      const { result } = renderHook(() => useRequestReview(mockRequest, mockOnClose));
      expect(result.current.cannotApprove({ resourceId: 'resource-1' })).toBe(false);
    });

    it('returns false for a resource when all delegation checks pass', async () => {
      mockLazyCheck.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue([{ result: true }, { result: true }]),
      });
      const { result } = renderWithData([makeResourceReq('req-r1', 'resource-1')]);
      await act(async () => {});
      expect(result.current.cannotApprove({ resourceId: 'resource-1' })).toBe(false);
    });

    it('returns true for a resource when any delegation check fails', async () => {
      mockLazyCheck.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue([{ result: true }, { result: false }]),
      });
      const { result } = renderWithData([makeResourceReq('req-r1', 'resource-1')]);
      await act(async () => {});
      expect(result.current.cannotApprove({ resourceId: 'resource-1' })).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------

  describe('derived values: hasPendingRequests / hasApprovableRequests', () => {
    it('hasPendingRequests is false with no snapshot data', () => {
      const { result } = renderHook(() => useRequestReview(mockRequest, mockOnClose));
      expect(result.current.hasPendingRequests).toBe(false);
    });

    it('hasPendingRequests is true when there are unprocessed items', async () => {
      const { result } = renderWithData([makeResourceReq('req-r1', 'resource-1')]);
      await act(async () => {});
      expect(result.current.hasPendingRequests).toBe(true);
    });

    it('hasPendingRequests is false once all items have been processed', async () => {
      const { result } = renderWithData([makeResourceReq('req-r1', 'resource-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleApprove({ resourceId: 'resource-1' });
      });
      expect(result.current.hasPendingRequests).toBe(false);
    });

    it('hasApprovableRequests is false with no snapshot data', () => {
      const { result } = renderHook(() => useRequestReview(mockRequest, mockOnClose));
      expect(result.current.hasApprovableRequests).toBe(false);
    });

    it('hasApprovableRequests is false when all items cannotApprove', async () => {
      mockCanDelegatePackage.mockReturnValue({ result: false, reasons: [] });
      const { result } = renderWithData([], [makePackageReq('req-p1', 'package-1')]);
      await act(async () => {});
      expect(result.current.hasApprovableRequests).toBe(false);
    });

    it('hasApprovableRequests is true when at least one item is approvable', async () => {
      mockCanDelegatePackage.mockReturnValue({ result: true, reasons: [] });
      const { result } = renderWithData([], [makePackageReq('req-p1', 'package-1')]);
      await act(async () => {});
      expect(result.current.hasApprovableRequests).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------

  describe('handleApprove', () => {
    it('calls approveRequest with the correct party and request ID', async () => {
      const { result } = renderWithData([makeResourceReq('req-r1', 'resource-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleApprove({ resourceId: 'resource-1' });
      });
      expect(mockApproveFn).toHaveBeenCalledWith({ party: PARTY_UUID, id: 'req-r1' });
    });

    it('marks the item as approved in processedRequests', async () => {
      const { result } = renderWithData([makeResourceReq('req-r1', 'resource-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleApprove({ resourceId: 'resource-1' });
      });
      expect(result.current.processedRequests['resource-1']).toEqual({
        status: 'approved',
        handledAt: LAST_UPDATED,
      });
    });

    it('works for packages as well as resources', async () => {
      const { result } = renderWithData([], [makePackageReq('req-p1', 'package-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleApprove({ packageId: 'package-1' });
      });
      expect(mockApproveFn).toHaveBeenCalledWith({ party: PARTY_UUID, id: 'req-p1' });
      expect(result.current.processedRequests['package-1']?.status).toBe('approved');
    });

    it('shows a success snackbar on approval', async () => {
      const { result } = renderWithData([makeResourceReq('req-r1', 'resource-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleApprove({ resourceId: 'resource-1' });
      });
      expect(mockOpenSnackbar).toHaveBeenCalledWith(expect.objectContaining({ color: 'success' }));
    });

    it('shows an error snackbar when approval fails', async () => {
      mockApproveFn.mockReturnValue({ unwrap: vi.fn().mockRejectedValue(new Error('API error')) });
      const { result } = renderWithData([makeResourceReq('req-r1', 'resource-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleApprove({ resourceId: 'resource-1' });
      });
      expect(mockOpenSnackbar).toHaveBeenCalledWith(expect.objectContaining({ color: 'danger' }));
    });
  });

  // ---------------------------------------------------------------------------

  describe('handleReject', () => {
    it('calls rejectRequest with the correct party and request ID', async () => {
      const { result } = renderWithData([makeResourceReq('req-r1', 'resource-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleReject({ resourceId: 'resource-1' });
      });
      expect(mockRejectFn).toHaveBeenCalledWith({ party: PARTY_UUID, id: 'req-r1' });
    });

    it('marks the item as rejected in processedRequests', async () => {
      const { result } = renderWithData([makeResourceReq('req-r1', 'resource-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleReject({ resourceId: 'resource-1' });
      });
      expect(result.current.processedRequests['resource-1']).toEqual({
        status: 'rejected',
        handledAt: LAST_UPDATED,
      });
    });

    it('works for packages as well as resources', async () => {
      const { result } = renderWithData([], [makePackageReq('req-p1', 'package-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleReject({ packageId: 'package-1' });
      });
      expect(mockRejectFn).toHaveBeenCalledWith({ party: PARTY_UUID, id: 'req-p1' });
      expect(result.current.processedRequests['package-1']?.status).toBe('rejected');
    });

    it('shows an error snackbar when rejection fails', async () => {
      mockRejectFn.mockReturnValue({ unwrap: vi.fn().mockRejectedValue(new Error('API error')) });
      const { result } = renderWithData([makeResourceReq('req-r1', 'resource-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleReject({ resourceId: 'resource-1' });
      });
      expect(mockOpenSnackbar).toHaveBeenCalledWith(expect.objectContaining({ color: 'danger' }));
    });
  });

  // ---------------------------------------------------------------------------

  describe('handleApproveAll', () => {
    it('approves all pending approvable resources and packages', async () => {
      mockCanDelegatePackage.mockReturnValue({ result: true, reasons: [] });
      const { result } = renderWithData(
        [makeResourceReq('req-r1', 'resource-1')],
        [makePackageReq('req-p1', 'package-1')],
      );
      await act(async () => {});
      await act(async () => {
        await result.current.handleApproveAll();
      });
      expect(result.current.processedRequests['resource-1']?.status).toBe('approved');
      expect(result.current.processedRequests['package-1']?.status).toBe('approved');
    });

    it('skips items where cannotApprove is true', async () => {
      mockCanDelegatePackage.mockImplementation((id: string) =>
        id === 'can-approve' ? { result: true, reasons: [] } : { result: false, reasons: [] },
      );
      const { result } = renderWithData(
        [],
        [makePackageReq('req-p1', 'can-approve'), makePackageReq('req-p2', 'cannot-approve')],
      );
      await act(async () => {});
      await act(async () => {
        await result.current.handleApproveAll();
      });
      expect(result.current.processedRequests['can-approve']?.status).toBe('approved');
      expect(result.current.processedRequests['cannot-approve']).toBeUndefined();
    });

    it('skips items that are already processed', async () => {
      const { result } = renderWithData([], [makePackageReq('req-p1', 'package-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleReject({ packageId: 'package-1' });
      });
      mockApproveFn.mockClear();
      await act(async () => {
        await result.current.handleApproveAll();
      });
      expect(mockApproveFn).not.toHaveBeenCalled();
    });

    it('shows a success snackbar when all approvals succeed', async () => {
      const { result } = renderWithData([], [makePackageReq('req-p1', 'package-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleApproveAll();
      });
      expect(mockOpenSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'success', message: 'request_page.approve_all_success' }),
      );
    });

    it('shows a partial failure snackbar when some approvals fail', async () => {
      let callCount = 0;
      mockApproveFn.mockImplementation(() => ({
        unwrap: vi.fn().mockImplementation(() => {
          callCount++;
          return callCount === 1
            ? Promise.resolve({ lastUpdated: LAST_UPDATED })
            : Promise.reject(new Error('API error'));
        }),
      }));
      const { result } = renderWithData(
        [],
        [makePackageReq('req-p1', 'package-1'), makePackageReq('req-p2', 'package-2')],
      );
      await act(async () => {});
      await act(async () => {
        await result.current.handleApproveAll();
      });
      expect(mockOpenSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          color: 'danger',
          message: 'request_page.approve_all_partial_failed',
        }),
      );
    });

    it('bulkActionLoading is null after the operation completes', async () => {
      const { result } = renderWithData([], [makePackageReq('req-p1', 'package-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleApproveAll();
      });
      expect(result.current.bulkActionLoading).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------

  describe('handleRejectAll', () => {
    it('rejects all pending items, including those that cannotApprove', async () => {
      mockCanDelegatePackage.mockImplementation((id: string) =>
        id === 'package-2' ? { result: false, reasons: [] } : { result: true, reasons: [] },
      );
      const { result } = renderWithData(
        [],
        [makePackageReq('req-p1', 'package-1'), makePackageReq('req-p2', 'package-2')],
      );
      await act(async () => {});
      await act(async () => {
        await result.current.handleRejectAll();
      });
      expect(result.current.processedRequests['package-1']?.status).toBe('rejected');
      expect(result.current.processedRequests['package-2']?.status).toBe('rejected');
    });

    it('skips items that are already processed', async () => {
      const { result } = renderWithData([], [makePackageReq('req-p1', 'package-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleApprove({ packageId: 'package-1' });
      });
      mockRejectFn.mockClear();
      await act(async () => {
        await result.current.handleRejectAll();
      });
      expect(mockRejectFn).not.toHaveBeenCalled();
    });

    it('shows a success snackbar when all rejections succeed', async () => {
      const { result } = renderWithData([], [makePackageReq('req-p1', 'package-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleRejectAll();
      });
      expect(mockOpenSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'success', message: 'request_page.reject_all_success' }),
      );
    });

    it('shows a partial failure snackbar when some rejections fail', async () => {
      let callCount = 0;
      mockRejectFn.mockImplementation(() => ({
        unwrap: vi.fn().mockImplementation(() => {
          callCount++;
          return callCount === 1
            ? Promise.resolve({ lastUpdated: LAST_UPDATED })
            : Promise.reject(new Error('API error'));
        }),
      }));
      const { result } = renderWithData(
        [],
        [makePackageReq('req-p1', 'package-1'), makePackageReq('req-p2', 'package-2')],
      );
      await act(async () => {});
      await act(async () => {
        await result.current.handleRejectAll();
      });
      expect(mockOpenSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          color: 'danger',
          message: 'request_page.reject_all_partial_failed',
        }),
      );
    });
  });

  // ---------------------------------------------------------------------------

  describe('handleClose', () => {
    it('calls the onClose callback', () => {
      const { result } = renderHook(() => useRequestReview(mockRequest, mockOnClose));
      act(() => {
        result.current.handleClose();
      });
      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('clears the snapshot and processedRequests', async () => {
      const { result } = renderWithData([makeResourceReq('req-r1', 'resource-1')]);
      await act(async () => {});
      await act(async () => {
        await result.current.handleApprove({ resourceId: 'resource-1' });
      });

      // Simulate the modal closing: queries return no data (request prop would become null)
      vi.mocked(requestApiModule.useGetEnrichedReceivedResourceRequestsQuery).mockReturnValue({
        data: [],
        isLoading: false,
        isFetching: false,
      } as any);
      vi.mocked(requestApiModule.useGetEnrichedReceivedPackageRequestsQuery).mockReturnValue({
        data: [],
        isLoading: false,
        isFetching: false,
      } as any);

      await act(async () => {
        result.current.handleClose();
      });
      expect(result.current.snapshotResources).toHaveLength(0);
      expect(result.current.processedRequests).toEqual({});
    });
  });

  // ---------------------------------------------------------------------------

  describe('handleSelection / resetSelection', () => {
    it('sets selectedResource and clears selectedPackage', () => {
      const resource = { identifier: 'resource-1' } as ServiceResource;
      const { result } = renderHook(() => useRequestReview(mockRequest, mockOnClose));
      act(() => {
        result.current.handleSelection({ resource });
      });
      expect(result.current.selectedResource).toBe(resource);
      expect(result.current.selectedPackage).toBeNull();
    });

    it('sets selectedPackage and clears selectedResource', () => {
      const resource = { identifier: 'resource-1' } as ServiceResource;
      const pkg = { id: 'package-1' } as AccessPackage;
      const { result } = renderHook(() => useRequestReview(mockRequest, mockOnClose));
      act(() => {
        result.current.handleSelection({ resource });
      });
      act(() => {
        result.current.handleSelection({ package: pkg });
      });
      expect(result.current.selectedPackage).toBe(pkg);
      expect(result.current.selectedResource).toBeNull();
    });

    it('resetSelection clears both selected items', () => {
      const resource = { identifier: 'resource-1' } as ServiceResource;
      const { result } = renderHook(() => useRequestReview(mockRequest, mockOnClose));
      act(() => {
        result.current.handleSelection({ resource });
      });
      act(() => {
        result.current.resetSelection();
      });
      expect(result.current.selectedResource).toBeNull();
      expect(result.current.selectedPackage).toBeNull();
    });
  });
});

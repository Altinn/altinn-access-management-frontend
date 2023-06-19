using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate;
namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    public interface IDelegationService
    {
        Task<List<DelegationCapabiltiesResponse>> RequestCanDelegateAccess(SingleRightDelegationInputDto request);
    }
}

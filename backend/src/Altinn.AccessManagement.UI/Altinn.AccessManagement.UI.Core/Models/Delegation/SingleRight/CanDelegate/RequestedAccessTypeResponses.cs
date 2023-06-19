namespace Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate
{
    public record RequestedAccessTypeResponses(DelegationCapabilityType RequestedDelegationCapabilityType, bool CanDelegate, string errorMessage);
}

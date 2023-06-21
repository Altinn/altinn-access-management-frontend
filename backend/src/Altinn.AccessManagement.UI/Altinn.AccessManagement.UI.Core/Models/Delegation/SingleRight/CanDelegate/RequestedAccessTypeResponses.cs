namespace Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate
{
    public record RequestedAccessTypeResponses(DelegationAccessType RequestedDelegationAccessType, bool CanDelegate, string errorMessage);
}

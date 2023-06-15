namespace Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate
{
    public record RequestedAccessTypeResponses(CanDelegateAccessType RequestedCanDelegateAccessType, bool CanDelegate, string errorMessage);
}

namespace Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate
{
    public record UserDelegationAccessCheckResponse(string RightKey, List<Resource> Resource, string Action, string Status, string FaultCode, string Reason, List<Role> Params);
}

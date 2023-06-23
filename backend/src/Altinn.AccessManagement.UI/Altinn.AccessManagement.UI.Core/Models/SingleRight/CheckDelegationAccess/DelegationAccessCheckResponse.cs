namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess
{
    public record DelegationAccessCheckResponse(string RightKey, List<Resource> Resource, string Action, string Status, string FaultCode, string Reason, List<Role> Params, HttpErrorResponse? HttpErrorResponse = null);
}

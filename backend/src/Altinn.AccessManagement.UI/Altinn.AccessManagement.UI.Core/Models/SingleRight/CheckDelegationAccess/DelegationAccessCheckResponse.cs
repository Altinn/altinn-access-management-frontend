using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess.CheckDelegationAccessDto;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess
{
    /// <summary>
    /// Represents the response of the backend.
    /// </summary>
    /// <param name="RightKey">The key for the right.</param>
    /// <param name="Resource">The list of resources.</param>
    /// <param name="Action">The action performed.</param>
    /// <param name="Status">The status of the response.</param>
    /// <param name="FaultCode">The fault code, if applicable.</param>
    /// <param name="Reason">The reason for the response.</param>
    /// <param name="Params">The list of parameters.</param>
    /// <param name="HttpErrorResponse">The optional HTTP error response.</param>
    public record DelegationAccessCheckResponse(string RightKey, List<Resource> Resource, string Action, string Status, string FaultCode, string Reason, List<Role> Params, HttpErrorResponse? HttpErrorResponse = null);
}

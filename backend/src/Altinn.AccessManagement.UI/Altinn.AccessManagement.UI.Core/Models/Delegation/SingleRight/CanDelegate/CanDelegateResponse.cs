namespace Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate
{
    public record CanDelegateResponse(string ResourceId, List<RequestedAccessTypeResponses> AccessTypeResponses);
}

namespace Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate
{
    public record DelegationCapabiltiesResponse(string RightKey, List<Resource> Resource, string Action, string Status, string FaultCode, string Reason, List<ParamObject> Params);

    public record ParamObject(string Name, string Value);

}

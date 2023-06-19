namespace Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate
{
    public record SingleRightDelegationInputDto(ToObject To, Resource[] Resources);

    public record ToObject(string Id, string Vaue);
}

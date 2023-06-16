namespace Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate
{
    public record SingleRightDelegationInput
    {
        public ToObject To { get; init; }
        public ResourceObject[] Resource { get; init; }
    }

    public record ToObject
    {
        public string Id { get; init; }
        public string Value { get; init; }
    }

    public record ResourceObject
    {
        public string Id { get; init; }
        public string Value { get; init; }
    }
}

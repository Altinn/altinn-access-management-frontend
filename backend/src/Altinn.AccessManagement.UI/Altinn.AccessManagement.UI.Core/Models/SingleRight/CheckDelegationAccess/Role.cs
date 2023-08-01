namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess
{
    /// <summary>
    /// The Role object returned by backend that says which roles that are required to delegate the resource
    /// </summary>
    /// <param name="Name">Name of the role</param>
    /// <param name="Value">Value</param>
    public record Role(string Name, string Value);
}

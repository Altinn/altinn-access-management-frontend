namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess.CheckDelegationAccessDto
{
    /// <summary>
    ///     The To object for the delegation
    /// </summary>
    /// <param name="Id">
    ///     The altinn ID of what field etc. That is used to be delegated to./param>
    ///     <param name="Value">The ID value of the field that is used to be delegated to.</param>
    ///     <returns></returns>
    public record Resource(string Id, string Value);
}
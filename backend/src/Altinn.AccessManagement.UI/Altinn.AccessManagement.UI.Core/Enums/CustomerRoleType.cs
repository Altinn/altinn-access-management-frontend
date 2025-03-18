namespace Altinn.AccessManagement.UI.Core.Enums
{
    /// <summary>
    /// Customer role type for systemuser
    /// </summary>
    public enum CustomerRoleType
    {
        /// <summary>
        /// Unknown or unspecified
        /// </summary>
        None = 0,

        /// <summary>
        /// Regnskapsfører customer
        /// </summary>
        Regnskapsforer = 1,

        /// <summary>
        /// Revisor customer
        /// </summary>
        Revisor = 2,

        /// <summary>
        /// Forretningsfører customer
        /// </summary>
        Forretningsforer = 3,
    }
}
namespace Altinn.AccessManagement.UI.Core.Models.Register
{
    /// <summary>
    /// Enum containing values for the different types of parties.
    /// This is a local version of the Registry type enum with correct spelling of the Organization
    /// </summary>
    public enum PartyType
    {
        /// <summary>
        /// Party Type is Person
        /// </summary>
        Person = 1,

        /// <summary>
        /// Party Type is Organization
        /// </summary>
        Organization = 2,

        /// <summary>
        /// Party Type is Self Identified user
        /// </summary>
        SelfIdentified = 3,

        /// <summary>
        /// Party Type is sub unit
        /// </summary>
        SubUnit = 4,

        /// <summary>
        /// Party Type is bankruptcy estate
        /// </summary>
        BankruptcyEstate = 5
    }
}
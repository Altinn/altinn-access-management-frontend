using System.Net;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Constants
{
    /// <summary>
    /// Validation problem descriptors for the Access management UI BFF.
    /// </summary>
    public static class AmProblem
    {
        private static readonly ValidationErrorDescriptorFactory _factory
      = ValidationErrorDescriptorFactory.New("AM");

        /// <summary>
        /// The field is required.
        /// </summary>
        public static ValidationErrorDescriptor Required => StdValidationErrors.Required;

        /// <summary>
        /// Gets a validation error descriptor for when an invalid Resource is provided.
        /// </summary>
        public static ValidationErrorDescriptor InvalidResource { get; }
            = _factory.Create(2, $"Resource must be valid.");

        /// <summary>
        /// Gets a validation error descriptor for when delegation is attempted to an unsupported unit type.
        /// </summary>
        public static ValidationErrorDescriptor InvalidUnitType { get; }
            = _factory.Create(28, "Cannot delegate to the selected unit type.");

        /// <summary>
        /// Gets a validation error descriptor for when the entity type is not allowed for the operation.
        /// </summary>
        public static ValidationErrorDescriptor DisallowedEntityType { get; }
            = _factory.Create(8, "This entity type is not allowed here.");

        /// <summary>
        /// Gets a validation error descriptor for when the given identifiers, such as person identifier and last name, match no one.
        /// </summary>
        public static ValidationErrorDescriptor InvalidExternalIdentifiers { get; }
            = _factory.Create(34, "Given external identifiers yielded empty result.");
    }
}

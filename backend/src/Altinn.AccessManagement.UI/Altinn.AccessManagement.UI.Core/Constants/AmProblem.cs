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
    }
}
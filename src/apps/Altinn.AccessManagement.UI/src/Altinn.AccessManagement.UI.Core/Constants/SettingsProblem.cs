using System.Net;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Constants
{
    /// <summary>
    /// Problem descriptors for the settings endpoints in the Access management UI BFF.
    /// </summary>
    public static class SettingsProblem
    {
        private static readonly ProblemDescriptorFactory _factory
            = ProblemDescriptorFactory.New("STUI");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor InvalidEmail { get; }
            = _factory.Create(0, HttpStatusCode.BadRequest, "Invalid email address");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor InvalidPhone { get; }
            = _factory.Create(1, HttpStatusCode.BadRequest, "Invalid phone number");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor InvalidCountryCode { get; }
            = _factory.Create(2, HttpStatusCode.BadRequest, "Invalid country code");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor OrganizationNotInEr { get; }
            = _factory.Create(3, HttpStatusCode.BadRequest, "Organization is not registered in Enhetsregisteret");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor AddressAlreadyExists { get; }
            = _factory.Create(4, HttpStatusCode.Conflict, "Notification address already exists");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor CannotDeleteLastAddress { get; }
            = _factory.Create(5, HttpStatusCode.Conflict, "Cannot delete the last notification address");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor AddressNotFound { get; }
            = _factory.Create(6, HttpStatusCode.NotFound, "Notification address not found");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor NotAuthorized { get; }
            = _factory.Create(7, HttpStatusCode.Forbidden, "Not authorized to change notification addresses");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor UnauthorizedUser { get; }
            = _factory.Create(98, HttpStatusCode.Unauthorized, "Unauthorized user");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor UnknownError { get; }
            = _factory.Create(99, HttpStatusCode.InternalServerError, "Unhandled error from backend");
    }
}

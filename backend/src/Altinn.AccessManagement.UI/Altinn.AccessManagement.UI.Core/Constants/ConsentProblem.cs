using System.Net;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Constants
{
    /// <summary>
    /// Problem descriptors for the Access management UI BFF.
    /// </summary>
    public static class ConsentProblem
    {
        private static readonly ProblemDescriptorFactory _factory
            = ProblemDescriptorFactory.New("CTUI");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor NotAuthorizedForConsentRequest { get; }
            = _factory.Create(0, HttpStatusCode.Forbidden, "Not authorized for consent");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor ConsentNotFound { get; }
            = _factory.Create(1, HttpStatusCode.NotFound, "Consent not found");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor ConsentCantBeAccepted { get; }  
            = _factory.Create(2, HttpStatusCode.BadRequest, "Consent have wrong status to be consented");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor ConsentCantBeRevoked { get; }
            = _factory.Create(10, HttpStatusCode.BadRequest, "Consent have wrong status to be revoked");
        
        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor ConsentRevoked { get; }
            = _factory.Create(11, HttpStatusCode.BadRequest, "Consent is revoked");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor ConsentExpired { get; }
            = _factory.Create(13, HttpStatusCode.BadRequest, "Consent is expired");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor ConsentNotAccepted { get; }
            = _factory.Create(14, HttpStatusCode.BadRequest, "Consent is not accepted");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor ConsentCantBeRejected { get; }
            = _factory.Create(15, HttpStatusCode.BadRequest, "Consent cant be rejected. Wrong status");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor ConsentResourceNotFound { get; }  
            = _factory.Create(96, HttpStatusCode.InternalServerError, "Consent resource not found");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor ConsentTemplateNotFound { get; }  
            = _factory.Create(97, HttpStatusCode.InternalServerError, "Consent template not found");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor UnauthorizedUser { get; }  
            = _factory.Create(98, HttpStatusCode.Unauthorized, "Unauthorized user");

        /// <summary>Gets a <see cref="ProblemDescriptor"/>.</summary>
        public static ProblemDescriptor UnknownError { get; }  
            = _factory.Create(99, HttpStatusCode.InternalServerError, "Unhandled error from backend");
    }
}
using System.Net;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Constants
{
    /// <summary>
    /// Problem descriptors for the Access management UI BFF.
    /// </summary>
    public static class Problem
    {
        private static readonly ProblemDescriptorFactory _factory
            = ProblemDescriptorFactory.New("AMUI");

        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor Reportee_Orgno_NotFound { get; }
            = _factory.Create(0, HttpStatusCode.BadRequest, "Can't resolve the Organisation Number from the logged in Reportee PartyId.");

        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor Rights_NotFound_Or_NotDelegable { get; }
            = _factory.Create(1, HttpStatusCode.BadRequest, "One or more Right not found or not delegable.");

        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor Rights_FailedToDelegate { get; }
            = _factory.Create(2, HttpStatusCode.BadRequest, "The Delegation failed.");

        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor SystemUser_FailedToCreate { get; }
            = _factory.Create(3, HttpStatusCode.BadRequest, "Failed to create the SystemUser.");

        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor SystemUser_AlreadyExists { get; }
            = _factory.Create(4, HttpStatusCode.BadRequest, "Failed to create new SystemUser, existing SystemUser tied to the given System-Id.");

        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor Generic_EndOfMethod { get; }
            = _factory.Create(5, HttpStatusCode.BadRequest, "Default error at the end of logic chain. Not supposed to appear.");

        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor RequestNotFound { get; }
            = _factory.Create(10, HttpStatusCode.NotFound, "The request was not found for given party.");

        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor SystemIdNotFound { get; }
            = _factory.Create(11, HttpStatusCode.NotFound, "The Id does not refer to a Registered System.");
            
        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor UnableToDoDelegationCheck { get; }
            = _factory.Create(14, HttpStatusCode.InternalServerError, "DelegationCheck failed with unknown error.");

        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor DelegationRightMissingRoleAccess { get; }
            = _factory.Create(16, HttpStatusCode.Forbidden, "DelegationCheck failed with error: Has not access by a delegation of role in ER or Altinn.");

        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor DelegationRightMissingDelegationAccess { get; }
            = _factory.Create(18, HttpStatusCode.Forbidden, "DelegationCheck failed with error: Has not access by direct delegation.");

        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor DelegationRightMissingSrrRightAccess { get; }
            = _factory.Create(19, HttpStatusCode.Forbidden, "DelegationCheck failed with error: The service requires explicit access in SRR and the reportee is missing this.");

        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor DelegationRightInsufficientAuthenticationLevel { get; }
            = _factory.Create(20, HttpStatusCode.Forbidden, "DelegationCheck failed with error: The service requires explicit authentication level and the reportee is missing this.");

        /// <summary>
        /// Gets a <see cref="ProblemDescriptor"/>.
        /// </summary>
        public static ProblemDescriptor CustomerIdNotFound { get; }
            = _factory.Create(28, HttpStatusCode.BadRequest, "The customer id was not provided or did not validate.");
    }
}
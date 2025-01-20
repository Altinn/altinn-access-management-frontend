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
    }
}
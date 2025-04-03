using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Problem descriptors for the Systemuser BFF.
    /// </summary>
    public static class ProblemMapper
    {
        /// <summary>
        /// Map error codes from AUTH to AMUI error codes
        /// </summary>
        public static ProblemDescriptor MapToAuthUiError(string authErrorCode)
        {
            return authErrorCode switch
            {
                "AUTH-00001" => Problem.Rights_NotFound_Or_NotDelegable,
                "AUTH-00002" => Problem.Rights_FailedToDelegate,
                "AUTH-00003" => Problem.SystemUser_FailedToCreate,
                "AUTH-00004" => Problem.SystemUser_AlreadyExists,
                "AUTH-00011" => Problem.SystemIdNotFound,
                "AUTH-00014" => Problem.UnableToDoDelegationCheck,
                "AUTH-00016" => Problem.DelegationRightMissingRoleAccess,
                "AUTH-00018" => Problem.DelegationRightMissingDelegationAccess,
                "AUTH-00019" => Problem.DelegationRightMissingSrrRightAccess,
                "AUTH-00020" => Problem.DelegationRightInsufficientAuthenticationLevel,
                "AUTH-00031" => Problem.CustomerDelegation_FailedToRevoke,
                "AUTH-00032" => Problem.AgentSystemUser_AssignmentNotFound,
                "AUTH-00033" => Problem.AgentSystemUser_FailedToDeleteAgent,
                "AUTH-00034" => Problem.AgentSystemUser_ExpectedAgentUserType,
                "AUTH-00035" => Problem.AgentSystemUser_HasDelegations,
                "AUTH-00036" => Problem.AgentSystemUser_ExpectedStandardUserType,
                "AUTH-00037" => Problem.AgentSystemUser_TooManyAssignments,
                "AUTH-00038" => Problem.AgentSystemUser_DelegationNotFound,
                "AUTH-00039" => Problem.AgentSystemUser_InvalidDelegationFacilitator,
                "AUTH-00040" => Problem.AgentSystemUser_DeleteDelegation_PartyMismatch,
                "AUTH-00041" => Problem.PartyId_Request_Mismatch,
                "AUTH-00042" => Problem.PartyId_AgentRequest_Mismatch,
                _ => Problem.Generic_EndOfMethod,
            };
        }
    }
}
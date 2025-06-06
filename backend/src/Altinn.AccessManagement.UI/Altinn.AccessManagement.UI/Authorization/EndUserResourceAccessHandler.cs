﻿using Altinn.AccessManagement.UI.Authorization.Helpers;
using Altinn.Authorization.ABAC.Xacml.JsonProfile;
using Altinn.Common.PEP.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Altinn.AccessManagement.UI.Authorization
{
    /// <summary>
    /// AuthorizationHandler that is created for handling access to enduser api.
    /// Authorizes based on ApiAccessRequirement and party id from route
    /// <see href="https://docs.asp.net/en/latest/security/authorization/policies.html"/> for details about authorization
    /// in asp.net core
    /// </summary>
    public class EndUserResourceAccessHandler : AuthorizationHandler<EndUserResourceAccessRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPDP _pdp;

        /// <summary>
        /// Initializes a new instance of the <see cref="EndUserResourceAccessHandler"/> class.
        /// </summary>
        /// <param name="httpContextAccessor">The http context accessor</param>
        /// <param name="pdp">The pdp</param>
        /// <param name="logger">The logger. </param>
        public EndUserResourceAccessHandler(
            IHttpContextAccessor httpContextAccessor,
            IPDP pdp,
            ILogger<EndUserResourceAccessHandler> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _pdp = pdp;
        }

        /// <summary>
        /// This method authorize access bases on context and requirement
        /// Is triggered by annotation on MVC action and setup in startup.
        /// </summary>
        /// <param name="context">The context</param>
        /// <param name="requirement">The requirement</param>
        /// <returns>A Task</returns>
        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, EndUserResourceAccessRequirement requirement)
        {
            HttpContext httpContext = _httpContextAccessor.HttpContext;

            if (httpContext == null)
            {
                await Task.CompletedTask;
                return;
            }

            try
            {
                XacmlJsonRequestRoot request = DecisionHelper.CreateDecisionRequest(context, requirement, httpContext.Request.Query);

                XacmlJsonResponse response = await _pdp.GetDecisionForRequest(request);

                bool userHasRequestedPartyAccess = DecisionHelper.ValidatePdpDecision(response, context.User);

                if (userHasRequestedPartyAccess)
                {
                    // The user is authorized to access the resource by policy set it in context and succeed
                    httpContext.Items.Add("HasRequestedPermission", true);
                    context.Succeed(requirement);
                    await Task.CompletedTask;
                    return;
                }
                else if (!requirement.AllowAllowUnauthorizedParty)
                {
                    context.Fail();
                    await Task.CompletedTask;
                    return;
                }
            }
            catch
            {
                context.Fail();
                await Task.CompletedTask;
                return;
            }

            httpContext.Items.Add("HasRequestedPermission", false);
            context.Succeed(requirement);
            await Task.CompletedTask;
        }
    }
}

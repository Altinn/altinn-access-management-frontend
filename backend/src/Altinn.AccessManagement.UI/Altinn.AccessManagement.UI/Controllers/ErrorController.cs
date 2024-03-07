﻿using System.Reflection.Metadata;
using Altinn.AccessManagement.UI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Handles the presentation of unhandled exceptions during the execution of a request.
    /// </summary>
    [ApiController]
    [ApiExplorerSettings(IgnoreApi = true)]
    [AllowAnonymous]
    [Route("accessmanagement/api/v1")]
    public class ErrorController(IErrorsService service) : ControllerBase
    {
        private IErrorsService Service { get; } = service;

        /// <summary>
        /// Create a response with a new <see cref="ProblemDetails"/> instance with limited information.
        /// </summary>
        /// <remarks>
        /// This method cannot be called directly. It is used by the API framework as a way to output ProblemDetails
        /// if there has been an unhandled exception.
        /// </remarks>
        /// <returns>A new <see cref="ObjectResult"/> instance.</returns>
        [Route("error")]
        public ActionResult<ProblemDetails> Error() => Problem();
    }
}

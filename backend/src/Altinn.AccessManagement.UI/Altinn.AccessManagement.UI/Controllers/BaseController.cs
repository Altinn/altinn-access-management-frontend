using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Base controller class providing common functionality for derived controllers.
    /// </summary>
    public abstract class BaseController : ControllerBase
    {
        /// <summary>
        /// Validates the model state and returns a BadRequest result if the model state is invalid.
        /// </summary>
        /// <returns>A BadRequest result if the model state is invalid; otherwise, null.</returns>
        protected ActionResult ValidateModelState()
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return null;
        }
    }
}
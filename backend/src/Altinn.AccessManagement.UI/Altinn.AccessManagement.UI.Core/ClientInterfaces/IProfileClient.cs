using Altinn.Platform.Profile.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with profile endpoints in access management component
    /// </summary>
    public interface IProfileClient
    {
        /// <summary>
        /// Gets the user's preferences from altinn profile
        /// </summary>
        /// <returns>users preferred settings</returns>
        Task<UserProfile> GetUserProfile();
    }
}

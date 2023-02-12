using Altinn.Platform.Profile.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    public interface IProfileClient
    {
        /// <summary>
        /// Gets user's preferences
        /// </summary>
        /// <returns></returns>
        Task<UserProfile> GetUserProfile();
    }
}

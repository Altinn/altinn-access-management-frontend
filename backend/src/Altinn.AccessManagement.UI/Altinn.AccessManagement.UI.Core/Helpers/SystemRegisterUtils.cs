using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Utils for resources
    /// </summary>
    public static class SystemRegisterUtils
    {
        /// <summary>
        /// Map a list of resources to frontend resource objects
        /// </summary>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="system">The system <see cref="RegisteredSystem"/> to convert to <see cref="RegisteredSystemFE"/></param>
        /// <param name="orgNames">List of org names to look up system vendor owner name</param>
        /// <returns>Frontend system object <see cref="RegisteredSystemFE"/></returns>
        public static RegisteredSystemFE MapToRegisteredSystemFE(string languageCode, RegisteredSystem system, List<PartyName> orgNames)
        {
            return new RegisteredSystemFE() 
            {
                SystemId = system.SystemId,
                Name = system.Name.TryGetValue(languageCode, out string name) ? name : "N/A",
                SystemVendorOrgNumber = system.SystemVendorOrgNumber,
                SystemVendorOrgName = orgNames.Find(x => x.OrgNo == system.SystemVendorOrgNumber)?.Name ?? "N/A"
            };
        }
    }
}
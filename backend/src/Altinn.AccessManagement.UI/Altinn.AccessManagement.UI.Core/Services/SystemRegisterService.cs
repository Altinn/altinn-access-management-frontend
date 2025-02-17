using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemRegisterService : ISystemRegisterService
    {
        private readonly ISystemRegisterClient _systemRegisterClient;
        private readonly IRegisterClient _registerClient;
        private readonly ResourceHelper _resourceHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemRegisterService"/> class.
        /// </summary>
        /// <param name="systemRegisterClient">The system register client.</param>
        /// <param name="registerClient">The register client.</param>
        /// <param name="resourceHelper">Resources helper to enrich resources</param>
        public SystemRegisterService(
            ISystemRegisterClient systemRegisterClient,
            IRegisterClient registerClient,
            ResourceHelper resourceHelper)
        {
            _systemRegisterClient = systemRegisterClient;
            _registerClient = registerClient;
            _resourceHelper = resourceHelper;
        }

        /// <inheritdoc />
        public async Task<List<RegisteredSystemFE>> GetSystems(string languageCode, CancellationToken cancellationToken)
        {
            List<RegisteredSystem> lista = await _systemRegisterClient.GetSystems(cancellationToken);
            IEnumerable<RegisteredSystem> visibleSystems = lista.Where(system => system.IsVisible);

            IEnumerable<string> orgNumbers = visibleSystems.Select(x => x.SystemVendorOrgNumber);
            List<PartyName> orgNames = await _registerClient.GetPartyNames(orgNumbers, cancellationToken);
            
            return visibleSystems.Select(system => SystemRegisterUtils.MapToRegisteredSystemFE(languageCode, system, orgNames)).ToList();
        }

        /// <inheritdoc />
        public async Task<RegisteredSystemRightsFE> GetSystemRights(string languageCode, string systemId, CancellationToken cancellationToken)
        {
            RegisteredSystem system = await _systemRegisterClient.GetSystem(systemId, cancellationToken);
            return await _resourceHelper.MapRightsToFrontendObjects(system.Rights, system.AccessPackages, languageCode);
        }
    }
}
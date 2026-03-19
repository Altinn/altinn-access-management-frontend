using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IInstanceClient"/> interface.
    /// </summary>
    public class InstanceClientMock : IInstanceClient
    {
        private readonly string dataFolder;

        /// <summary>
        /// Initializes a new instance of the <see cref="InstanceClientMock"/> class.
        /// </summary>
        /// <param name="httpClient">Unused http client.</param>
        /// <param name="logger">Unused logger.</param>
        /// <param name="httpContextAccessor">Unused http context accessor.</param>
        public InstanceClientMock(
            HttpClient httpClient,
            ILogger<InstanceClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public Task<List<InstancePermission>> GetDelegatedInstances(string languageCode, Guid party, Guid? from, Guid? to, string resource, string instance)
        {
            ThrowExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Instance", "GetInstances", "instances.json");
            IEnumerable<InstancePermission> instances = Util.GetMockData<List<InstancePermission>>(dataPath);

            if (from.HasValue)
            {
                instances = instances.Where(permission => permission.Permissions.Any(item => item.From?.Id == from.Value));
            }

            if (to.HasValue)
            {
                instances = instances.Where(permission => permission.Permissions.Any(item => item.To?.Id == to.Value));
            }

            if (!string.IsNullOrWhiteSpace(resource))
            {
                instances = instances.Where(permission => string.Equals(permission.Resource?.RefId, resource, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(instance))
            {
                instances = instances.Where(permission => string.Equals(permission.Instance.RefId, instance, StringComparison.OrdinalIgnoreCase));
            }

            return Task.FromResult(instances.ToList());
        }

        /// <inheritdoc />
        public Task<ResourceCheckDto> GetDelegationCheck(Guid party, string resource, string instance)
        {
            ThrowExceptionIfTriggerParty(party.ToString());

            string instancePath = Path.Combine(dataFolder, "Instance", "GetInstances", "instances.json");
            List<InstancePermission> instances = Util.GetMockData<List<InstancePermission>>(instancePath);
            bool knownInstanceExists = instances.Any(permission =>
                string.Equals(permission.Instance?.RefId, instance, StringComparison.OrdinalIgnoreCase));

            if (!knownInstanceExists)
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
            }

            try
            {
                string dataPath = Path.Combine(dataFolder, "Instance", "DelegationCheck", $"{resource}.json");
                return Task.FromResult(Util.GetMockData<ResourceCheckDto>(dataPath));
            }
            catch
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateInstanceRightsAccess(Guid party, Guid? to, string resource, string instance, InstanceRightsDelegationDto input)
        {
            ThrowExceptionIfTriggerParty(party.ToString());

            string instancePath = Path.Combine(dataFolder, "Instance", "GetInstances", "instances.json");
            List<InstancePermission> instances = Util.GetMockData<List<InstancePermission>>(instancePath);
            bool instanceExists = instances.Any(permission =>
                string.Equals(permission.Resource?.RefId, resource, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(permission.Instance?.RefId, instance, StringComparison.OrdinalIgnoreCase));

            if (!instanceExists)
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
            }

            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        /// <inheritdoc />
        public Task<InstanceRights> GetInstanceRights(string languageCode, Guid party, Guid from, Guid to, string resource, string instance)
        {
            ThrowExceptionIfTriggerParty(party.ToString());

            string instancePath = Path.Combine(dataFolder, "Instance", "GetInstances", "instances.json");
            List<InstancePermission> instances = Util.GetMockData<List<InstancePermission>>(instancePath);
            bool knownInstanceExists = instances.Any(permission =>
                string.Equals(permission.Instance?.RefId, instance, StringComparison.OrdinalIgnoreCase));

            if (!knownInstanceExists)
            {
                throw new HttpStatusException("NotFound", "Instance rights not found", HttpStatusCode.NotFound, "");
            }

            try
            {
                string dataPath = Path.Combine(dataFolder, "Instance", "GetInstanceRights", $"{resource}.json");
                InstanceRights instanceRights = Util.GetMockData<InstanceRights>(dataPath);
                return Task.FromResult(instanceRights);
            }
            catch (FileNotFoundException)
            {
                throw new HttpStatusException("NotFound", "Instance rights not found", HttpStatusCode.NotFound, "");
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> UpdateInstanceRightsAccess(Guid party, Guid to, string resource, string instance, List<string> actionKeys)
        {
            ThrowExceptionIfTriggerParty(party.ToString());

            string instancePath = Path.Combine(dataFolder, "Instance", "GetInstances", "instances.json");
            List<InstancePermission> instances = Util.GetMockData<List<InstancePermission>>(instancePath);
            bool instanceExists = instances.Any(permission =>
                string.Equals(permission.Resource?.RefId, resource, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(permission.Instance?.RefId, instance, StringComparison.OrdinalIgnoreCase));

            if (!instanceExists)
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
            }

            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        private static void ThrowExceptionIfTriggerParty(string id)
        {
            if (id == "********" || id == "00000000-0000-0000-0000-000000000000")
            {
                throw new Exception();
            }
        }
    }
}

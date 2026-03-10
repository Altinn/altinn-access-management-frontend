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
        public Task<List<InstancePermission>> GetInstances(string languageCode, Guid party, Guid? from, Guid? to, string resource, string instance)
        {
            ThrowExceptionIfTriggerParty(party.ToString());

            IEnumerable<InstancePermission> instances = LoadInstancePermissions();

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
                instances = instances.Where(permission => string.Equals(permission.Instance?.Urn, instance, StringComparison.OrdinalIgnoreCase));
            }

            return Task.FromResult(instances.ToList());
        }

        /// <inheritdoc />
        public Task<ResourceCheckDto> GetDelegationCheck(Guid party, string resource, string instance)
        {
            ThrowExceptionIfTriggerParty(party.ToString());

            if (!KnownInstanceExists(instance) || !MockDataExists("DelegationCheck", resource))
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
        public async Task<HttpResponseMessage> CreateInstanceRightsAccess(Guid party, Guid to, string resource, string instance, List<string> actionKeys)
        {
            ThrowExceptionIfTriggerParty(party.ToString());

            if (!InstanceExists(resource, instance))
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
            }

            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        /// <inheritdoc />
        public Task<InstanceRight> GetInstanceRights(string languageCode, Guid party, Guid from, Guid to, string resource, string instance)
        {
            ThrowExceptionIfTriggerParty(party.ToString());

            if (!KnownInstanceExists(instance) || !MockDataExists("GetInstanceRights", resource))
            {
                throw new HttpStatusException("NotFound", "Instance rights not found", HttpStatusCode.NotFound, "");
            }

            string dataPath = Path.Combine(dataFolder, "Instance", "GetInstanceRights", $"{resource}.json");
            InstanceRight instanceRights = Util.GetMockData<InstanceRight>(dataPath);
            return Task.FromResult(instanceRights);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> UpdateInstanceRightsAccess(Guid party, Guid to, string resource, string instance, List<string> actionKeys)
        {
            ThrowExceptionIfTriggerParty(party.ToString());

            if (!InstanceExists(resource, instance))
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

        // Keep the shared instance dataset in one place because several mock endpoints
        // validate against the same mocked list, not just the list endpoint itself.
        private List<InstancePermission> LoadInstancePermissions()
        {
            string dataPath = Path.Combine(dataFolder, "Instance", "GetInstances", "instances.json");
            return Util.GetMockData<List<InstancePermission>>(dataPath);
        }

        // Used by create/update flows where the mock should only accept an exact
        // resource + instance combination that exists in the mocked instances list.
        private bool InstanceExists(string resource, string instance)
        {
            return LoadInstancePermissions().Any(permission =>
                string.Equals(permission.Resource?.RefId, resource, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(permission.Instance?.Urn, instance, StringComparison.OrdinalIgnoreCase));
        }

        // Used by rights/check endpoints because they also support mock-only resource
        // variants such as null/null-rights files that are not present in the instances list.
        private bool KnownInstanceExists(string instance)
        {
            return LoadInstancePermissions().Any(permission =>
                string.Equals(permission.Instance?.Urn, instance, StringComparison.OrdinalIgnoreCase));
        }

        // Used to guard file-backed mock endpoints before reading a resource-specific
        // payload, so missing mock files still return the expected not found/bad request.
        private bool MockDataExists(string operation, string resource)
        {
            string dataPath = Path.Combine(dataFolder, "Instance", operation, $"{resource}.json");
            return File.Exists(dataPath);
        }
    }
}

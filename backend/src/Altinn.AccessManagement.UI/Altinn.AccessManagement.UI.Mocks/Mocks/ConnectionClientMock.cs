using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.Register.Contracts.V1;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IConnectionClient"></see> interface
    /// </summary>
    public class ConnectionClientMock : IConnectionClient
    {
        private static int _numberOfFaliedPersonLookups = 0;
        private static readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="AccessManagementClientMock" /> class
        /// </summary>
        public ConnectionClientMock(
            HttpClient httpClient,
            ILogger<AccessManagementClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
        }


        /// <inheritdoc/>
        public Task<HttpResponseMessage> RevokeRightHolderConnection(Guid party, Guid? from, Guid? to)
        {

            if (party == Guid.Empty)
            {
                throw new HttpStatusException("Test", "Testing unexpected status from backend", HttpStatusCode.BadRequest, null);
            }

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        }

        /// <inheritdoc/>
        public Task<List<Connection>> GetConnections(Guid party, Guid? from, Guid? to)
        {
            if (party == Guid.Empty)
            {
                throw new HttpStatusException("Test", "Mock internal server error", HttpStatusCode.InternalServerError, null);
            }

            // Special case for 404 testing - return null for specific party UUID
            if (party == Guid.Parse("00000000-0000-0000-0000-000000000404"))
            {
                return Task.FromResult<List<Connection>>(null);
            }

            try
            {
                var testDataPath = Path.Combine(dataFolder, "RightHolders", $"{party}.json");
                var jsonContent = File.ReadAllText(testDataPath);
                var connections = JsonSerializer.Deserialize<List<Connection>>(jsonContent, options);
                return Task.FromResult(connections);
            }
            catch
            {
                return Task.FromResult(new List<Connection>());
            }
        }

        /// <inheritdoc/>
        public Task<Guid> PostNewRightHolderConnection(Guid party, Guid? to, PersonInput personInput = null, CancellationToken cancellationToken = default)
        {
            if (personInput != null && personInput.LastName == "BadRequest")
            {
                throw new HttpStatusException("Test", "Mock bad request error", HttpStatusCode.BadRequest, null);
            }

            if (party == Guid.Empty)
            {
                throw new HttpStatusException("Test", "Mock internal server error", HttpStatusCode.InternalServerError, null);
            }

            if (personInput != null)
            {
                Person person = null;

                string testDataPath = Path.Combine(Path.GetDirectoryName(new Uri(typeof(RegisterClientMock).Assembly.Location).LocalPath), "Data", "Register", "Persons", $"{personInput.PersonIdentifier}.json");
                if (File.Exists(testDataPath))
                {
                    string content = File.ReadAllText(testDataPath);
                    Person personContent = JsonSerializer.Deserialize<Person>(content, options);
                    if (personContent.LastName.ToLower() == personInput.LastName.ToLower())
                    {
                        person = personContent;
                    }
                }

                if (person == null)
                {
                    _numberOfFaliedPersonLookups++;
                    if (_numberOfFaliedPersonLookups > 3)
                    {
                        throw new HttpStatusException("Status Error", "Too many failed person lookups", HttpStatusCode.TooManyRequests, null);
                    }
                    else
                    {
                        throw new HttpStatusException("Status Error", "Person not found", HttpStatusCode.NotFound, null);
                    }
                }

                if (person != null)
                {
                    return Task.FromResult(Guid.NewGuid());
                }
            }

            return to.HasValue ? Task.FromResult(to.Value) : Task.FromException<Guid>(new InvalidOperationException("No valid Guid provided."));
        }
    }
}

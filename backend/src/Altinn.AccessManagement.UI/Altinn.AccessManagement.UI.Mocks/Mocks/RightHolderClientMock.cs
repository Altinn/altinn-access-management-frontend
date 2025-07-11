﻿using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.User;
using Bogus.Extensions.UnitedKingdom;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text;
using System.Text.Json;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IRightHolderClient"></see> interface
    /// </summary>
    public class RightHolderClientMock : IRightHolderClient
    {
        private static readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="AccessManagementClientMock" /> class
        /// </summary>
        public RightHolderClientMock(
            HttpClient httpClient,
            ILogger<AccessManagementClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
        }


        /// <inheritdoc/>
        public Task<HttpResponseMessage> RevokeRightHolder(Guid party, Guid? from, Guid? to)
        {

            if (party == Guid.Empty)
            {
                throw new HttpStatusException("Test", "Testing unexpected status from backend", HttpStatusCode.BadRequest, null);
            }

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        }

        /// <inheritdoc/>
        public Task<List<Connection>> GetRightHolders(Guid party, Guid? from, Guid? to)
        {
            if (party == Guid.Empty)
            {
                throw new HttpStatusException("Test", "Mock internal server error", HttpStatusCode.InternalServerError, null);
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
        public Task<HttpResponseMessage> PostNewRightHolder(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            if (party == Guid.Empty)
            {
                throw new HttpStatusException("Test", "Mock internal server error", HttpStatusCode.InternalServerError, null);
            }
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        }
    }
}

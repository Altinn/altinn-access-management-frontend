﻿using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Logging;


namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IAccessPackageClient"></see> interface
    /// </summary>
    public class AccessPackageClientMock : IAccessPackageClient
    {
        private static readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="AccessManagementClientMock" /> class
        /// </summary>
        public AccessPackageClientMock(
            HttpClient httpClient,
            ILogger<AccessManagementClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public Task<IEnumerable<SearchObject<AccessPackage>>> GetAccessPackageSearchMatches(string languageCode, string searchString)
        {

            IEnumerable<SearchObject<AccessPackage>> searchResults = Util.GetMockData<IEnumerable<SearchObject<AccessPackage>>>($"{dataFolder}/AccessPackage/packages.json");

            return searchString != null ? Task.FromResult(searchResults.Where(sr => sr.Object.Name.ToLower().Contains(searchString.ToLower()))) : Task.FromResult(searchResults);
        }

        /// <inheritdoc />
        public async Task<PaginatedResult<PackagePermission>> GetAccessPackageAccesses(Guid party, Guid? to, Guid? from, Guid? packageId, string languageCode)
        {
            Util.ThrowExceptionIfTriggerParty(from.ToString());

            try
            {
                string dataPath = Path.Combine(dataFolder, "AccessPackage", "GetDelegations", $"{from}_{to}.json");
                return await Task.FromResult(Util.GetMockData<PaginatedResult<PackagePermission>>(dataPath));
            }
            catch
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
            }
        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> CreateAccessPackageDelegation(Guid party, Guid to, Guid from, string packageId)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());

            if (packageId == string.Empty || packageId == null)
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            else if (packageId == "5eb07bdc-5c3c-4c85-add3-5405b214b8a3") // Package is Renovasjon
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            if (packageId == "fails_with_validation_error_00002") // Validation error from backend
            {
                var problemDetailsJson = @"
                {
                    ""status"": 400,
                    ""title"": ""One or more validation errors occurred."",
                    ""detail"": ""The provided data is invalid."",
                    ""instance"": ""urn:altinn:error:instance:12345"",
                    ""validationErrors"": [
                        {
                            ""code"": ""AM.VLD-00002"",
                            ""description"": ""The value for 'field' is not valid.""
                        }
                    ]
                }";

                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent(problemDetailsJson)
                });
            }
            if (packageId == "fails_with_validation_error_00003") // Validation error from backend
            {
                var problemDetailsJson = @"
                {
                    ""status"": 400,
                    ""title"": ""One or more validation errors occurred."",
                    ""detail"": ""The provided data is invalid."",
                    ""instance"": ""urn:altinn:error:instance:12345"",
                    ""validationErrors"": [
                        {
                            ""code"": ""unhandled_validation_error"",
                            ""description"": "".""
                        }
                    ]
                }";

                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent(problemDetailsJson)
                });
            }
            else
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.Created));
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeAccessPackage(Guid from, Guid to, Guid party, string resourceId)
        {
            string dataPath = Path.Combine(dataFolder, "AccessPackage", "RevokeDelegation");

            var mockResponse = await Util.GetMockedHttpResponse(dataPath, resourceId);
            if (mockResponse.IsSuccessStatusCode)
            {
                return new HttpResponseMessage(HttpStatusCode.NoContent);
            }
            throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", mockResponse.StatusCode, "");
        }

        public Task<AccessPackage> GetAccessPackageById(string languageCode, Guid packageId)
        {
            try
            {
                // Reuse existing mock data used for search and pick the requested package
                string dataPath = Path.Combine(dataFolder, "AccessPackage", "packages.json");
                IEnumerable<SearchObject<AccessPackage>> searchResults =
                    Util.GetMockData<IEnumerable<SearchObject<AccessPackage>>>(dataPath);

                AccessPackage result = null;
                if (searchResults != null)
                {
                    foreach (var sr in searchResults)
                    {
                        if (sr?.Object?.Id == packageId)
                        {
                            result = sr.Object;
                            break;
                        }
                    }
                }

                return Task.FromResult(result);
            }
            catch
            {
                throw new HttpStatusException(
                    "StatusError",
                    "Unexpected mockResponse status from Access Management",
                    HttpStatusCode.BadRequest,
                    "");
            }
        }
    }
}

﻿using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Microsoft.AspNetCore.Http;
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
    }
}

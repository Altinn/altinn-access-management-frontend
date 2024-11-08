﻿using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class AccessPackageService : IAccessPackageService
    {
        private readonly IAccessManagementClient _accessManagementClient;
        private readonly IAccessPackageClient _accessPackageClient;

        private readonly JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        /// Initializes a new instance of the <see cref="SingleRightService"/> class.
        /// </summary>
        /// <param name="accessManagementClient">The access management client.</param>
        /// <param name="accessPackageClient">The access package client.</param>
        public AccessPackageService(IAccessManagementClient accessManagementClient, IAccessPackageClient accessPackageClient)
        {
            _accessManagementClient = accessManagementClient;
            _accessPackageClient = accessPackageClient;
        }

        /// <inheritdoc />
        public async Task<List<AccessAreaFE>> GetSearch(string languageCode, string searchString)
        {
            List<AccessPackage> searchMatches = await _accessPackageClient.GetAccessPackageSearchMatches(languageCode, searchString);

            List<AccessAreaFE> sortedAreas = new List<AccessAreaFE>();

            foreach (AccessPackage searchMatch in searchMatches)
            {
                int premadeAreaIndex = sortedAreas.FindIndex(area => area.Id == searchMatch.Id);

                if (premadeAreaIndex < 0)
                {
                    sortedAreas.Add(new AccessAreaFE(searchMatch.Area, new List<AccessPackage> { searchMatch }));
                }
                else
                {
                    sortedAreas[premadeAreaIndex].AccessPackages.Add(searchMatch);
                }
            }

            return sortedAreas;
        }
    }
}

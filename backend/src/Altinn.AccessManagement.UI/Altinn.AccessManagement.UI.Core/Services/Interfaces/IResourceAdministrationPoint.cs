﻿using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for creating and updating Resources in AccessMAnagment existing in the ResourceRegister
    /// </summary>
    public interface IResourceAdministrationPoint
    {
        /// <summary>
        /// Gets a list of all Extended Resources from ResourceRegister
        /// </summary>
        /// <param name="languageCode">logged in user's preferred language</param>
        /// <returns>resource list based on resource type</returns>
        Task<List<ServiceResourceFE>> GetExtendedResources(string languageCode);

        /// <summary>
        /// Gets a list of Resources from ResourceRegister
        /// </summary>
        /// <param name="resourceType">The type of resource to be filtered</param>
        /// <param name="languageCode">logged in user's preferred language</param>
        /// <returns>resource list based on resource type</returns>
        Task<List<ServiceResourceFE>> GetRegistryResources(ResourceType resourceType, string languageCode);

        /// <summary>
        /// Gets a list of Resources from ResourceRegister
        /// </summary>
        /// <param name="scopes">The scope of the resource</param>
        /// <returns>resource list based on given scope</returns>
        Task<List<ServiceResource>> GetRegistryResources(string scopes);

        /// <summary>
        /// Gets a list of Resources from ResourceRegister
        /// </summary>
        /// <param name="resourceIds">The list of resource ids</param>
        /// <returns>resource list based on given resource ids</returns>
        Task<List<ServiceResource>> GetRegistryResources(List<string> resourceIds);

        /// <summary>
        /// Integration point for retrieving a single resoure by it's resource id
        /// </summary>
        /// <param name="resourceRegistryId">The identifier of the resource in the Resource Registry</param>
        /// <returns>The resource if exists</returns>
        Task<ServiceResource> GetRegistryResource(string resourceRegistryId);
    }
}
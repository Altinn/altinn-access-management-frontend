namespace Altinn.AccessManagement.UI.Core.Configuration
{
    /// <summary>
    /// Cache configuration settings
    /// </summary>
    public class CacheConfig
    {
        /// <summary>
        /// Gets or sets the cache timeout (in minutes) for lookup of party information
        /// </summary>
        public int PartyCacheTimeout { get; set; }

        /// <summary>
        /// Gets or sets the cache timeout (in minutes) for lookup of a resource from the resource registry
        /// </summary>
        public int ResourceRegistryResourceCacheTimeout { get; set; }        
    }
}

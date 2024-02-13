namespace Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

/// <summary>
/// Filter and search parameters for api search
/// </summary>
public class ApiSearchParams
{
    /// <summary>
    /// The search string which content must be present
    /// </summary>
    public string? SearchString { get; set; }

    /// <summary>
    /// List of Resource Owners to be used for filtering (owner's org number)
    /// </summary>
    public string[]? ROFilters { get; set; }
}
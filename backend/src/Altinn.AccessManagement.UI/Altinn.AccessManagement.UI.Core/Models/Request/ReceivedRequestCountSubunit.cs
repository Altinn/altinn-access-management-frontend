using Altinn.AccessManagement.UI.Core.Models.User;

namespace Altinn.AccessManagement.UI.Core.Models.Request;

/// <summary>
/// Number of received requests for a subunit
/// </summary>
public class ReceivedRequestCountSubunit
{
    /// <summary>
    /// The subunit
    /// </summary>
    public Entity Party { get; set; }

    /// <summary>
    /// Number of requests received by the subunit
    /// </summary>
    public int Count { get; set; }
}

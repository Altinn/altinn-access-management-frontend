using Microsoft.Extensions.Caching.Memory;

namespace Altinn.AccessManagement.UI.Integrations.Client;

/// <summary>
/// Sends a HTTP request.
/// </summary>
public class RequestSender(ILogger logger, HttpClient httpClient, HttpRequestMessage request, IMemoryCache cache, IHttpContextAccessor accessor)
{
    private ILogger Logger { get; } = logger;

    private HttpClient HttpClient { get; } = httpClient;

    private HttpRequestMessage Request { get; } = request;

    private IHttpContextAccessor Accessor { get; } = accessor;

    private IMemoryCache Cache { get; } = cache;

    private TimeSpan CacheTTL { get; set; } = TimeSpan.Zero;

    private string CacheKey => $"{Request.Method} {Request.RequestUri}";

    private MemoryCacheEntryOptions CacheOptions => new MemoryCacheEntryOptions()
        .SetPriority(CacheItemPriority.High)
        .SetAbsoluteExpiration(CacheTTL);

    /// <summary>
    /// Logs the outbound request.
    /// </summary>
    public RequestSender LogRequest()
    {
        Logger.LogInformation("log request here");
        return this;
    }

    /// <summary>
    /// Caches the response if the request were successful and remove the response from cache after
    /// given paramter TimeSpan parameter.
    /// </summary>
    /// <param name="ttl">Time to live - for the response.</param>
    public RequestSender CacheResponse(TimeSpan ttl)
    {
        var maxDuration = TimeSpan.FromMinutes(5);
        if (maxDuration < ttl)
        {
            ttl = maxDuration;
        }

        CacheTTL = ttl;
        return this;
    }

    /// <summary>
    /// Sends the request.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    public async Task<ResponseComposer> Send(CancellationToken cancellationToken)
    {
        if (CacheTTL != TimeSpan.Zero)
        {
            if (Cache.TryGetValue(CacheKey, out HttpResponseMessage entry))
            {
                return new ResponseComposer(logger, entry);
            }
        }

        var response = await HttpClient.SendAsync(Request, cancellationToken);

        if (CacheTTL != TimeSpan.Zero && response.IsSuccessStatusCode)
        {
            Cache.Set(CacheKey, response, CacheOptions);
        }

        return new ResponseComposer(logger, response);
    }

    /// <summary>
    /// Sends the request using the HTTP context's cancellation token.
    /// </summary>
    public async Task<ResponseComposer> Send() => await Send(Accessor.HttpContext.RequestAborted);
}
using Microsoft.Extensions.Caching.Memory;

namespace Altinn.AccessManagement.UI.Integrations.Client;

/// <summary>
/// Sends a HTTP request.
/// </summary>
public partial class RequestSender(ILogger<RequestSender> logger, IServiceProvider services, HttpClient httpClient, IMemoryCache cache, IHttpContextAccessor accessor)
{
    public HttpRequestMessage Request { get; private set; } = new();

    private ILogger Logger { get; } = logger;

    private IServiceProvider Services { get; } = services;

    private HttpClient HttpClient { get; } = httpClient;

    private IHttpContextAccessor Accessor { get; } = accessor;

    private IMemoryCache Cache { get; } = cache;

    private TimeSpan CacheTTL { get; set; } = TimeSpan.Zero;

    private Action LogRequestBeforeSending { get; set; } = () => { };

    public RequestSender SetRequest(HttpRequestMessage request)
    {
        Request = request;
        return this;
    }

    private string CacheKey => $"{Request.Method} {Request.RequestUri}";

    private MemoryCacheEntryOptions CacheOptions => new MemoryCacheEntryOptions()
        .SetPriority(CacheItemPriority.High)
        .SetAbsoluteExpiration(CacheTTL);

    /// <summary>
    /// Logs only the route and HTTP verb for outbound reques.
    /// </summary>
    public RequestSender LogRoute()
    {
        LogRequestBeforeSending = () => Log.Route(Logger, Request.Method, Request.RequestUri);
        return this;
    }

    /// <summary>
    /// Logs the whole outbound request including the payload.
    /// </summary>
    public RequestSender LogRequest()
    {
        LogRequestBeforeSending = () => Log.Request(Logger, Request.Method, Request.RequestUri, Request.Content);
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
                Log.CacheHit(Logger, entry.RequestMessage.Method, entry.RequestMessage.RequestUri);
                return Services.GetRequiredService<ResponseComposer>()
                    .SetResponse(entry);
            }
        }

        LogRequestBeforeSending();
        var response = await HttpClient.SendAsync(Request, cancellationToken);

        if (CacheTTL != TimeSpan.Zero && response.IsSuccessStatusCode)
        {
            Log.CacheResponse(Logger, response.RequestMessage.Method, response.RequestMessage.RequestUri);
            Cache.Set(CacheKey, response, CacheOptions);
        }

        return Services.GetRequiredService<ResponseComposer>()
                .SetResponse(response);
    }

    /// <summary>
    /// Sends the request using the HTTP context's cancellation token.
    /// </summary>
    public async Task<ResponseComposer> Send() => await Send(Accessor.HttpContext.RequestAborted);

    private static partial class Log
    {
        [LoggerMessage(1, LogLevel.Information, "Sending HTTP request {verb}: {route}")]
        public static partial void Route(ILogger logger, HttpMethod verb, Uri route);

        [LoggerMessage(2, LogLevel.Information, "Sending HTTP request {verb}: {route}\n\n\n {payload}")]
        public static partial void Request(ILogger logger, HttpMethod verb, Uri route, HttpContent payload);

        [LoggerMessage(3, LogLevel.Information, "Caching response for HTTP request {verb}: {route}")]
        public static partial void CacheResponse(ILogger logger, HttpMethod verb, Uri route);

        [LoggerMessage(4, LogLevel.Information, "Cache HIT for request {verb}: {route}")]
        public static partial void CacheHit(ILogger logger, HttpMethod verb, Uri route);
    }
}
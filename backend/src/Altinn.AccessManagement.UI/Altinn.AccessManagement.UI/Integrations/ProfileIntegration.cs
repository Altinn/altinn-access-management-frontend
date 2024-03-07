using Altinn.AccessManagement.UI.Configuration;
using Altinn.AccessManagement.UI.Integrations.Client;
using Altinn.AccessManagement.UI.Integrations.Profile.Models;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integrations;

public interface IProfileIntegration
{
    Task<ProfileUserModel> Get(int party);

    Task<ProfileUserModel> Get(Guid uuid);
}

/// <summary>
/// Profile Integration.
/// </summary>
/// <typeparam name="PlatformSettings"></typeparam>
public class ProfileIntegration(RequestComposer request, IOptions<Appsettings> options) : IProfileIntegration
{
    private RequestComposer Request { get; }

    private IOptions<Appsettings> Appsettings { get; } = options;

    public async Task<ProfileUserModel> Get(int party)
    {
        var response = await Request.New(
            Request.WithAccessToken,
            Request.WithMethod(HttpMethod.Get),
            Request.WithRoute(Appsettings.Value.PlatformSettings.ApiProfileEndpoint, "users", party)
        )
        .LogRequest()
        .Send();

        return await response
        .LogResponse()
        .Assert(response.ThrowIfNotOk)
        .DeserializeAsync<ProfileUserModel>();
    }

    public async Task<ProfileUserModel> Get(Guid uuid)
    {
        var response = await Request.New(
            Request.WithAccessToken,
            Request.WithMethod(HttpMethod.Get),
            Request.WithRoute(Appsettings.Value.PlatformSettings.ApiProfileEndpoint, "users", "byuuid", uuid)
        )
        .LogRequest()
        .Send();

        return await response
        .LogResponse()
        .Assert(response.ThrowIfNotOk)
        .DeserializeAsync<ProfileUserModel>();
    }
}
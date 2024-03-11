using Altinn.AccessManagement.UI.Configuration;
using Altinn.AccessManagement.UI.Integrations.Client;
using Altinn.AccessManagement.UI.Integrations.Register.Models;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integrations;

public interface IRegisterIntegration
{
    public Task<RegisterPartyModel> GetOrganization(string organizationNumber);

    public Task<IEnumerable<RegisterPartyModel>> GetParties(IEnumerable<Guid> uuids);
}

public class RegisterIntegration(RequestComposer request, IOptions<Appsettings> options) : IRegisterIntegration
{
    private RequestComposer Request { get; } = request;

    private IOptions<Appsettings> Options { get; } = options;

    public async Task<RegisterPartyModel> GetOrganization(string organizationNumber)
    {
        var respone = await Request.New(
                Request.WithMethod(HttpMethod.Post),
                Request.WithRoute(Options.Value.PlatformSettings.ApiRegisterEndpoint, "parties", "lookup"),
                Request.WithAccessToken,
                Request.WithHeaderAcceptJson,
                Request.WithBodyJson<RegisterPartyInputModel>(new() { OrgNo = organizationNumber })
            )
            .LogRoute()
            .Send();

        return await respone
            .Assert(respone.ThrowIfNotSuccessful)
            .LogResponse()
            .DeserializeAsync<RegisterPartyModel>();
    }

    public async Task<IEnumerable<RegisterPartyModel>> GetParties(IEnumerable<Guid> uuids)
    {
        var response = await Request.New(
            Request.WithMethod(HttpMethod.Post),
            Request.WithRoute(Options.Value.PlatformSettings.ApiRegisterEndpoint, "parties", "partylistbyuuid"),
            Request.WithAccessToken,
            Request.WithHeaderAcceptJson,
            Request.WithBodyJson(uuids)
        )
        .LogRoute()
        .Send();

        return await response
            .Assert(response.ThrowIfNotSuccessful)
            .LogResponse()
            .DeserializeAsync<IEnumerable<RegisterPartyModel>>();
    }
}
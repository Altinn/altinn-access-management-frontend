using Altinn.AccessManagement.UI.Integrations;
using Altinn.AccessManagement.UI.Integrations.Profile.Models;
using Altinn.AccessManagement.UI.Integrations.Register.Models;
using Altinn.AccessManagement.UI.Mappers;
using Altinn.AccessManagement.UI.Models;

namespace Altinn.AccessManagement.UI.Services;

public interface IActorsService
{
    Task<UserModel> GetUser(Guid uuid);

    Task<OrganizationModel> GetOrganization(string organisationNumber);
}

public class ActorsService(
        IIntegrations integrations,
        IMapper<ProfileUserModel, UserModel> userMapper,
        IMapper<RegisterPartyModel, OrganizationModel> organizationMapper) : IActorsService
{
    private IIntegrations Integrations { get; } = integrations;

    private IMapper<ProfileUserModel, UserModel> UserMapper { get; } = userMapper;

    private IMapper<RegisterPartyModel, OrganizationModel> OrganizationMapper { get; } = organizationMapper;

    /// <inheritdoc/>
    public async Task<UserModel> GetUser(Guid uuid) => UserMapper.Map(await Integrations.Profile.Get(uuid));

    /// <inheritdoc/>
    public async Task<OrganizationModel> GetOrganization(string organisationNumber) => OrganizationMapper.Map(await Integrations.Register.GetOrganization(organisationNumber));
}
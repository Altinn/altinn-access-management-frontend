using Altinn.AccessManagement.UI.Integrations.Profile.Models;
using Altinn.AccessManagement.UI.Models;

namespace Altinn.AccessManagement.UI.Mappers
{
    public class ActorsMapper : IMapper<OrganizationModel, OrganizationModel>, IMapper<ProfileUserModel, UserModel>
    {
        public UserModel Map(ProfileUserModel from) => new()
        {
            PartyId = from.PartyId,
            UserId = from.UserId,
            UserName = from.UserName,
        };

        public OrganizationModel Map(OrganizationModel from)
        {
            throw new NotImplementedException();
        }
    }
}
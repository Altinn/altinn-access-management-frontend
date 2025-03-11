using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.Register;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IRegisterClientV2"></see> interface
    /// </summary>
    public class RegisterClientV2Mock : IRegisterClientV2
    {
        private readonly string dataFolder;
   
        private static readonly JsonSerializerOptions _options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="RegisterClientV2Mock"/> class
        /// </summary>
        public RegisterClientV2Mock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(SystemUserClientMock).Assembly.Location).LocalPath), "Data");
        }

        public Task<CustomerList> GetPartyCustomers(Guid partyUuid, CustomerRoleType customerType, CancellationToken cancellationToken)
        {
            string jsonFile = customerType == CustomerRoleType.Regnskapsforer ? "regnskapsforerCustomers.json" : "revisorCustomers.json";
            CustomerList systemUsers = Util.GetMockData<CustomerList>($"{dataFolder}/Register/Parties/{jsonFile}");
            /*
            for (int i = 0; i < 100; i++)
            {
                systemUsers.Data.Add(new PartyRecord()
                {
                    DisplayName = string.Join("", Enumerable.Repeat(0, 15).Select(n => (char)new Random().Next(100,120))),
                    PartyId= i,
                    OrganizationIdentifier = "123456789",
                    PartyUuid = Guid.NewGuid()
                });
            }
            */
            return Task.FromResult(systemUsers);
        }
    }
}

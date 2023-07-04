using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Mocks.Mocks;

namespace Altinn.AccessManagement.UI.Mocks.Utils
{
    public class SingleRightUtil
    {
        public static List<DelegationAccessCheckResponse> GetMockedDelegationAccessCheckResponses(AccessLevel accessLevel)
        {
            string? unitTestFolder = Path.GetDirectoryName(new Uri(typeof(SingleRightClientMock).Assembly.Location).LocalPath);

            string fileName = Convert.ToString(accessLevel);


            string path = Path.Combine(unitTestFolder, "Data", "SingleRight", "DelegationAccessCheckResponse");
            string content = File.ReadAllText(Path.Combine(path, $"{fileName}.json"));

            JsonSerializerOptions options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };

            List<DelegationAccessCheckResponse> responses = JsonSerializer.Deserialize<List<DelegationAccessCheckResponse>>(content, options);

            return responses;
        }
    }
}

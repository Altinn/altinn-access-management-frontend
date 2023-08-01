using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Models.SingleRight.CheckDelegationAccess;

namespace Altinn.AccessManagement.UI.Mocks.Utils
{
    public static class SingleRightUtil
    {
        public static List<DelegationAccessCheckResponse> GetMockedDelegationAccessCheckResponses(AccessLevel accessLevel)
        {
            string? unitTestFolder = Path.GetDirectoryName(new Uri(typeof(SingleRightClientMock).Assembly.Location).LocalPath);

            string filename = Convert.ToString(accessLevel) + ".json";


            string path = Path.Combine(unitTestFolder, "Data", "SingleRight", "DelegationAccessCheckResponse", filename);

            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"The file with path {path} does not exist");
            }
            string content = File.ReadAllText(Path.Combine(path));

            JsonSerializerOptions options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };

            List<DelegationAccessCheckResponse> responses = JsonSerializer.Deserialize<List<DelegationAccessCheckResponse>>(content, options);

            return responses;
        }
    }
}

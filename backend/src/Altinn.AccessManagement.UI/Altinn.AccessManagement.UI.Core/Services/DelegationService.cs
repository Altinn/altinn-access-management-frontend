using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate;
namespace Altinn.AccessManagement.UI.Core.Services
{
    public class DelegationService
    {
        public async Task<List<DelegationCapabiltiesResponse>> RequestCanDelegateAccess(SingleRightDelegationInputDto request)
        {
            
        }

        private async Task<List<DelegationCapabiltiesResponse>> ProduceStaticCanDelegateResponse()
        {
            List<MyRecord> records = new List<MyRecord>
            {
                new MyRecord
                {
                    RightKey = "ttd-am-k6/read",
                    Resource = new List<ResourceObject>
                    {
                        new ResourceObject
                        {
                            Id = "urn:altinn:resource",
                            Value = "ttd-am-k6",
                        },
                    },
                    Action = "read",
                    Status = "Delegable",
                    FaultCode = "",
                    Reason = "User does not match any of the required role requirements (DAGL, REGNA)",
                    Params = new List<ParamObject>
                    {
                        new ParamObject
                        {
                            Name = "RoleRequirements",
                            Value = "DAGL, REGNA",
                        },
                    },
                },
                new MyRecord
                {
                    RightKey = "ttd-am-k6/write",
                    Resource = new List<ResourceObject>
                    {
                        new ResourceObject
                        {
                            Id = "urn:altinn:resource",
                            Value = "ttd-am-k6",
                        },
                    },
                    Action = "write",
                    Status = "NotDelegable",
                    FaultCode = "UserMissingRight",
                    Reason = "User does not match any of the required role requirements (DAGL, REGNA)",
                    Params = new List<ParamObject>
                    {
                        new ParamObject
                        {
                            Name = "RoleRequirements",
                            Value = "DAGL, REGNA",
                        },
                    },
                },
                new MyRecord
                {
                    RightKey = "ttd-am-k6/sign",
                    Resource = new List<ResourceObject>
                    {
                        new ResourceObject
                        {
                            Id = "urn:altinn:resource",
                            Value = "ttd-am-k6",
                        },
                    },
                    Action = "sign",
                    Status = "NotDelegable",
                    FaultCode = "UserMissingRight",
                    Reason = "User does not match any of the required role requirements (DAGL, REGNA)",
                    Params = new List<ParamObject>
                    {
                        new ParamObject
                        {
                            Name = "RoleRequirements",
                            Value = "DAGL, REGNA",
                        },
                    },
                },
            };

            string json = JsonConvert.SerializeObject(records);
            StringContent content = new StringContent(json, Encoding.UTF8, "application/json");
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = content,
            };

            // Access the JSON response string
            string responseJson = await response.Content.ReadAsStringAsync();
            Console.WriteLine(responseJson);
        }
    }
}

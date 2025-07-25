using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.AccessManagement.UI.Core.Models.Consent;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IConsentClient"></see> interface
    /// </summary>
    public class ConsentClientMock : IConsentClient
    {
        private readonly string dataFolder;

        private readonly Guid PERSON_CONSENT_ID = Guid.Parse("e2071c55-6adf-487b-af05-9198a230ed44");
        private readonly Guid ORG_CONSENT_ID = Guid.Parse("7e540335-d82f-41e9-8b8f-619336d792b4");
        private readonly Guid ORG_CONSENT_WITHOUT_MESSAGE_ID = Guid.Parse("1a04a7fa-24c1-4e06-9217-8aee89239a9f");

        /// <summary>
        ///     Initializes a new instance of the <see cref="ConsentClientMock" /> class
        /// </summary>
        public ConsentClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(ConsentClientMock).Assembly.Location).LocalPath), "Data");
        }

        public Task<Result<ConsentRequestDetails>> GetConsentRequest(Guid consentRequestId, CancellationToken cancellationToken)
        {
            if (consentRequestId == PERSON_CONSENT_ID)
            {
                ConsentRequestDetails request = Util.GetMockData<ConsentRequestDetails>($"{dataFolder}/Consent/consentRequest_person.json");
                return Task.FromResult(new Result<ConsentRequestDetails>(request));
            }
            else if (consentRequestId == ORG_CONSENT_ID)
            {
                ConsentRequestDetails request = Util.GetMockData<ConsentRequestDetails>($"{dataFolder}/Consent/consentRequest_org.json");
                return Task.FromResult(new Result<ConsentRequestDetails>(request));
            }
            else if (consentRequestId == ORG_CONSENT_WITHOUT_MESSAGE_ID)
            {
                ConsentRequestDetails request = Util.GetMockData<ConsentRequestDetails>($"{dataFolder}/Consent/consentRequest_org_without_message.json");
                return Task.FromResult(new Result<ConsentRequestDetails>(request));
            }
            return Task.FromResult(new Result<ConsentRequestDetails>(ConsentProblem.ConsentNotFound));
        }

        public Task<Result<bool>> RejectConsentRequest(Guid consentRequestId, CancellationToken cancellationToken)
        {
            if (consentRequestId == PERSON_CONSENT_ID)
            {
                return Task.FromResult(new Result<bool>(true));
            }
            else if (consentRequestId == ORG_CONSENT_ID)
            {
                return Task.FromResult(new Result<bool>(true));
            }

            return Task.FromResult(new Result<bool>(ConsentProblem.ConsentCantBeRejected));
        }

        public Task<Result<bool>> ApproveConsentRequest(Guid consentRequestId, ApproveConsentContext context, CancellationToken cancellationToken)
        {
            if (consentRequestId == PERSON_CONSENT_ID)
            {
                return Task.FromResult(new Result<bool>(true));
            }
            else if (consentRequestId == ORG_CONSENT_ID)
            {
                return Task.FromResult(new Result<bool>(true));
            }

            return Task.FromResult(new Result<bool>(ConsentProblem.ConsentCantBeAccepted));
        }

        public Task<List<ConsentTemplate>> GetConsentTemplates(CancellationToken cancellationToken)
        {
           List<ConsentTemplate> consentTemplates = Util.GetMockData<List<ConsentTemplate>>($"{dataFolder}/Consent/consentTemplates.json");
           return Task.FromResult(consentTemplates);
        }
    }
}
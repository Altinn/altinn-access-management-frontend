using System.Globalization;
using System.Text;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Consent;
using Altinn.AccessManagement.UI.Core.Models.Consent.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class ConsentService : IConsentService
    {
        private readonly IConsentClient _consentClient;
        private readonly IRegisterClient _registerClient;
        private readonly IResourceRegistryClient _resourceRegistryClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserService"/> class.
        /// </summary>
        /// <param name="consentClient">The consent client.</param>
        /// <param name="registerClient">The register client.</param>
        /// <param name="resourceRegistryClient">Resources client to load resources</param>
        public ConsentService(
            IConsentClient consentClient,
            IRegisterClient registerClient,
            IResourceRegistryClient resourceRegistryClient)
        {
            _consentClient = consentClient;
            _registerClient = registerClient;
            _resourceRegistryClient = resourceRegistryClient;
        }

        /// <inheritdoc />
        public async Task<Result<ConsentRequestFE>> GetConsentRequest(Guid consentRequestId, CancellationToken cancellationToken)
        {
            // GET consent request
            Result<ConsentRequestDetails> request = await _consentClient.GetConsentRequest(consentRequestId, cancellationToken);

            if (request.IsProblem)
            {
                return request.Problem;
            }

            // GET all resources in request
            string templateId = string.Empty;
            bool isOneTimeConsent = false;
            List<ConsentRightFE> rights = [];
            foreach (ConsentRight right in request.Value.ConsentRights)
            {
                string resourceId = right.Resource.Find(x => x.Type == "urn:altinn:resource")?.Value;
                ServiceResource resource = await _resourceRegistryClient.GetResource(resourceId);
                templateId = resource.ConsentTemplate;
                isOneTimeConsent = resource.IsOneTimeConsent;

                rights.Add(new()
                {
                    Identifier = resource.Identifier,
                    Title = resource.Title,
                    ConsentTextHtml = ReplaceMarkdownInText(ReplaceMetadataInTranslationsDict(resource.ConsentText, right.MetaData)),
                });
            }
            
            // GET metadata template used in resource
            List<ConsentTemplate> consentTemplates = await _consentClient.GetConsentTemplates();
            ConsentTemplate consentTemplate = consentTemplates.FirstOrDefault((template) => template.Id == templateId);
            if (consentTemplate == null)
            {
                return ConsentProblem.ConsentTemplateNotFound;
            }

            Dictionary<string, string> title;
            Dictionary<string, string> heading;
            Dictionary<string, string> serviceIntro;
            
            bool isFromOrg = IsOrgUrn(request.Value.From);
            if (isFromOrg)
            {
                title = consentTemplate.Texts.Title.Org;
                heading = consentTemplate.Texts.Heading.Org;
                serviceIntro = consentTemplate.Texts.ServiceIntro.Org;
            }
            else 
            {
                title = consentTemplate.Texts.Title.Person;
                heading = consentTemplate.Texts.Heading.Person;
                serviceIntro = consentTemplate.Texts.ServiceIntro.Person;
            }

            var expirationText = isOneTimeConsent ? consentTemplate.Texts.ExpirationOneTime : consentTemplate.Texts.Expiration;
            Dictionary<string, string> staticMetadata = await GetStaticMetadata(request.Value);
            return new ConsentRequestFE()
            {
                Id = request.Value.Id,
                Rights = rights,
                IsPoa = consentTemplate.IsPoa,
                Status = request.Value.ConsentRequestStatus,
                Title = ReplaceMetadataInTranslationsDict(title, staticMetadata),
                Heading = ReplaceMetadataInTranslationsDict(heading, staticMetadata),
                ServiceIntro = ReplaceMetadataInTranslationsDict(serviceIntro, staticMetadata),
                HandledBy = ReplaceMetadataInTranslationsDict(consentTemplate.Texts.HandledBy, staticMetadata),
                ConsentMessage = request.Value.Requestmessage ?? ReplaceMetadataInTranslationsDict(consentTemplate.Texts.OverriddenDelegationContext, staticMetadata),
                Expiration = ReplaceMetadataInTranslationsDict(expirationText, staticMetadata)
            };
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RejectConsentRequest(Guid consentRequestId, CancellationToken cancellationToken)
        {
            return await _consentClient.RejectConsentRequest(consentRequestId, cancellationToken);
        }

        private async Task<Dictionary<string, string>> GetStaticMetadata(ConsentRequestDetails request)
        {
            Party to = await GetParty(request.To);
            Party from = await GetParty(request.From);
            Party handledBy = request.HandledBy != null ? await GetParty(request.HandledBy) : null;
            return new()
            {
                { "CoveredBy", to.Name },
                { "OfferedBy", from.Name },
                { "HandledBy", handledBy?.Name },
                { "Expiration", request.ValidTo.ToString("dd.MM.yyyy hh:mm", CultureInfo.InvariantCulture) }
            };
        }

        private static bool IsOrgUrn(string urn)
        {
            return urn.Contains("altinn:organization:identifier-no");
        }

        private async Task<Party> GetParty(string urn)
        {
            string id = urn.Split(':').Last();
            Party party = IsOrgUrn(urn) ? await _registerClient.GetPartyForOrganization(id) : await _registerClient.GetPartyForPerson(id);
            return party;
        }

        private static Dictionary<string, string> ReplaceMetadataInTranslationsDict(Dictionary<string, string> translations, Dictionary<string, string> metadata)
        {
            Dictionary<string, string> replacedTranslations = new();

            foreach (var (key, value) in translations)
            {
                replacedTranslations[key] = ReplaceMetadataInText(value, metadata);
            }

            return replacedTranslations;
        }

        // replace metadata values. For example, given the text "Hi {name}!" and metadata dict { name: "John" }, will result in the string "Hi John!" 
        private static string ReplaceMetadataInText(string text, Dictionary<string, string> metadata)
        {
            StringBuilder sb = new StringBuilder(text);
            
            foreach (var (key, valueString) in metadata)
            {
                sb.Replace($"{{{key}}}", valueString ?? string.Empty);
            }

            return sb.ToString();
        }

        private static Dictionary<string, string> ReplaceMarkdownInText(Dictionary<string, string> translations)
        {
            Dictionary<string, string> replacedTranslations = new();

            foreach (var (key, value) in translations)
            {
                replacedTranslations[key] = MarkdownConverter.ConvertToHtml(value);
            }

            return replacedTranslations;
        }
    }
}

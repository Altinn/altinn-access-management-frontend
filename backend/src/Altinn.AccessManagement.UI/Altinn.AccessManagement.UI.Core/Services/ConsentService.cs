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
using Altinn.Platform.Register.Enums;
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
        /// Initializes a new instance of the <see cref="ConsentService"/> class.
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

            Result<EnrichedConsentTemplate> enrichedConsentTemplate = await EnrichConsentTemplate(
                request.Value.ConsentRights,
                request.Value.From,
                request.Value.To,
                request.Value.HandledBy,
                request.Value.ValidTo,
                request.Value.TemplateId,
                request.Value.TemplateVersion,
                request.Value.RequestMessage,
                cancellationToken);

            if (enrichedConsentTemplate.IsProblem)
            {
                return enrichedConsentTemplate.Problem;
            }

            return new ConsentRequestFE()
            {
                Id = request.Value.Id,
                Rights = enrichedConsentTemplate.Value.Rights,
                IsPoa = enrichedConsentTemplate.Value.IsPoa,
                Title = enrichedConsentTemplate.Value.Title,
                Heading = enrichedConsentTemplate.Value.Heading,
                ServiceIntro = enrichedConsentTemplate.Value.ServiceIntro,
                HandledBy = enrichedConsentTemplate.Value.HandledBy,
                ConsentMessage = enrichedConsentTemplate.Value.ConsentMessage,
                Expiration = enrichedConsentTemplate.Value.Expiration,
                FromPartyName = enrichedConsentTemplate.Value.FromPartyName,
            };
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RejectConsentRequest(Guid consentRequestId, CancellationToken cancellationToken)
        {
            return await _consentClient.RejectConsentRequest(consentRequestId, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<bool>> ApproveConsentRequest(Guid consentRequestId, ApproveConsentContext context, CancellationToken cancellationToken)
        {
            return await _consentClient.ApproveConsentRequest(consentRequestId, context, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<string>> GetConsentRequestRedirectUrl(Guid consentRequestId, CancellationToken cancellationToken)
        {
            Result<ConsentRequestDetails> request = await _consentClient.GetConsentRequest(consentRequestId, cancellationToken);
            if (request.IsProblem)
            {
                return request.Problem;
            }
            
            return request.Value.RedirectUrl;
        }

        private static Dictionary<string, string> GetStaticMetadata(Party to, Party from, Party handledBy, DateTimeOffset requestValidTo)
        {
            return new()
            {
                { "CoveredBy", to.Name },
                { "OfferedBy", from.Name },
                { "HandledBy", handledBy?.Name },
                { "Expiration", requestValidTo.ToString("dd.MM.yyyy HH:mm", CultureInfo.InvariantCulture) }
            };
        }

        private static string GetUrnValue(string urn)
        {
            string[] parts = urn?.Split(':');
            if (parts == null || parts.Length < 2)
            {
                throw new ArgumentException($"Invalid URN format: {urn}");
            }

            return parts.Last();
        }

        private static Dictionary<string, string> ReplaceMetadataInTranslationsDict(Dictionary<string, string> translations, Dictionary<string, string> metadata)
        {
            if (metadata == null)
            {
                return translations;
            }
            
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

        private async Task<(Party To, Party From, Party HandledBy)> GetConsentParties(string toUrn, string fromUrn, string handledByUrn)
        {
            // map urns ("urn:altinn:party:uuid:167536b5-f8ed-4c5a-8f48-0279507e53ae") to named party objects
            string toUrnValue = GetUrnValue(toUrn);
            string fromUrnValue = GetUrnValue(fromUrn);
            string handledByUrnValue = handledByUrn != null ? GetUrnValue(handledByUrn) : null;

            IEnumerable<string> urnValues = [toUrnValue, fromUrnValue, handledByUrnValue];
            IEnumerable<Guid> partyGuidsToLookup = urnValues.Where(urn => urn != null)
                .Select(urn => Guid.TryParse(urn, out var guid) ? guid : (Guid?)null)
                .Where(guid => guid.HasValue)
                .Select(guid => guid.Value);
            List<Party> parties = await _registerClient.GetPartyList(partyGuidsToLookup.ToList());

            Party toParty = parties.FirstOrDefault(party => party.PartyUuid.ToString() == toUrnValue);
            Party fromParty = parties.FirstOrDefault(party => party.PartyUuid.ToString() == fromUrnValue);
            Party handledByParty = parties.FirstOrDefault(party => party.PartyUuid.ToString() == handledByUrnValue);

            return (To: toParty, From: fromParty, HandledBy: handledByParty);
        }

        private async Task<Result<EnrichedConsentTemplate>> EnrichConsentTemplate(
            IEnumerable<ConsentRight> consentRights, 
            string fromUrn,
            string toUrn,
            string handledByUrn,
            DateTimeOffset validTo,
            string templateId,
            int templateVersion,
            Dictionary<string, string> requestMessage,
            CancellationToken cancellationToken)
        {
            // GET all resources in request
            bool isOneTimeConsent = false;
            List<ConsentRightFE> rights = [];
            foreach (ConsentRight right in consentRights)
            {
                string resourceId = right.Resource.Find(x => x.Type == "urn:altinn:resource")?.Value;

                try 
                {
                    ServiceResource resource = await _resourceRegistryClient.GetResource(resourceId);
                    isOneTimeConsent = resource.IsOneTimeConsent;

                    rights.Add(new()
                    {
                        Identifier = resource.Identifier,
                        Title = resource.Title,
                        ConsentTextHtml = ReplaceMarkdownInText(ReplaceMetadataInTranslationsDict(resource.ConsentText, right.MetaData)),
                    });
                }
                catch
                {
                    return ConsentProblem.ConsentResourceNotFound;
                }
            }

            // GET metadata template used in resource
            List<ConsentTemplate> consentTemplates = await _consentClient.GetConsentTemplates(cancellationToken);
            ConsentTemplate consentTemplate = consentTemplates.FirstOrDefault((template) => template.Id == templateId && template.Version == templateVersion);
            if (consentTemplate == null)
            {
                return ConsentProblem.ConsentTemplateNotFound;
            }

            var expirationText = isOneTimeConsent ? consentTemplate.Texts.ExpirationOneTime : consentTemplate.Texts.Expiration;

            var (toParty, fromParty, handledByParty) = await GetConsentParties(toUrn, fromUrn, handledByUrn);

            Dictionary<string, string> staticMetadata = GetStaticMetadata(toParty, fromParty, handledByParty, validTo);
            Dictionary<string, string> title;
            Dictionary<string, string> heading;
            Dictionary<string, string> serviceIntro;
            Dictionary<string, string> serviceIntroAccepted;

            bool isFromOrg = fromParty.PartyTypeName == PartyType.Organisation || fromParty.PartyTypeName == PartyType.SubUnit;
            if (isFromOrg)
            {
                title = consentTemplate.Texts.Title.Org;
                heading = consentTemplate.Texts.Heading.Org;
                serviceIntro = consentTemplate.Texts.ServiceIntro.Org;
                serviceIntroAccepted = consentTemplate.Texts.ServiceIntroAccepted.Org;
            }
            else 
            {
                title = consentTemplate.Texts.Title.Person;
                heading = consentTemplate.Texts.Heading.Person;
                serviceIntro = consentTemplate.Texts.ServiceIntro.Person;
                serviceIntroAccepted = consentTemplate.Texts.ServiceIntroAccepted.Person;
            }

            return new EnrichedConsentTemplate()
            {
                Rights = rights,
                IsPoa = consentTemplate.IsPoa,
                Title = ReplaceMetadataInTranslationsDict(title, staticMetadata),
                Heading = ReplaceMetadataInTranslationsDict(heading, staticMetadata),
                ServiceIntro = ReplaceMetadataInTranslationsDict(serviceIntro, staticMetadata),
                ServiceIntroAccepted = ReplaceMetadataInTranslationsDict(serviceIntroAccepted, staticMetadata),
                TitleAccepted = ReplaceMetadataInTranslationsDict(consentTemplate.Texts.TitleAccepted, staticMetadata),
                HandledBy = handledByParty != null ? ReplaceMetadataInTranslationsDict(consentTemplate.Texts.HandledBy, staticMetadata) : null,
                ConsentMessage = requestMessage ?? ReplaceMetadataInTranslationsDict(consentTemplate.Texts.OverriddenDelegationContext, staticMetadata),
                Expiration = ReplaceMetadataInTranslationsDict(expirationText, staticMetadata),
                FromPartyName = isFromOrg ? fromParty.Name : null
            };
        }
    }
}
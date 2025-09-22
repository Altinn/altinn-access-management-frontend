using System.Globalization;
using System.Text;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Consent;
using Altinn.AccessManagement.UI.Core.Models.Consent.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;
using Altinn.Platform.Register.Enums;
using Altinn.Platform.Register.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class ConsentService : IConsentService
    {
        private readonly ILogger<ConsentService> _logger;
        private readonly IConsentClient _consentClient;
        private readonly IRegisterClient _registerClient;
        private readonly IResourceRegistryClient _resourceRegistryClient;
        private readonly CacheConfig _cacheConfig;
        private readonly IMemoryCache _memoryCache;

        /// <summary>
        /// Initializes a new instance of the <see cref="ConsentService"/> class.
        /// </summary>
        /// <param name="logger">Logger instance.</param>
        /// <param name="consentClient">The consent client.</param>
        /// <param name="registerClient">The register client.</param>
        /// <param name="resourceRegistryClient">Resources client to load resources</param>
        /// <param name="memoryCache">the handler for cache</param>
        /// <param name="cacheConfig">the handler for cache configuration</param>
        public ConsentService(
            ILogger<ConsentService> logger,
            IConsentClient consentClient,
            IRegisterClient registerClient,
            IResourceRegistryClient resourceRegistryClient,
            IMemoryCache memoryCache,
            IOptions<CacheConfig> cacheConfig)
        {
            _logger = logger;
            _consentClient = consentClient;
            _registerClient = registerClient;
            _resourceRegistryClient = resourceRegistryClient;
            _memoryCache = memoryCache;
            _cacheConfig = cacheConfig.Value;
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

            ConsentTemplateParams templateParams = new()
            {
                ConsentRights = request.Value.ConsentRights,
                FromUrn = request.Value.From,
                ToUrn = request.Value.To,
                HandledByUrn = request.Value.HandledBy,
                ValidTo = request.Value.ValidTo,
                TemplateId = request.Value.TemplateId,
                TemplateVersion = request.Value.TemplateVersion,
                RequestMessage = request.Value.RequestMessage,
            };
            Result<EnrichedConsentTemplate> enrichedConsentTemplate = await EnrichConsentTemplate(templateParams, cancellationToken);

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
                ConsentRequestEvents = request.Value.ConsentRequestEvents,
                ValidTo = request.Value.ValidTo,
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

        /// <inheritdoc />
        public async Task<Result<List<ActiveConsentItemFE>>> GetActiveConsents(Guid party, CancellationToken cancellationToken)
        {
            Result<List<ConsentRequestDetails>> consents = await _consentClient.GetConsentList(party, cancellationToken);
            if (consents.IsProblem)
            {
                return consents.Problem;
            }

            HashSet<string> excludedStatuses = new(StringComparer.OrdinalIgnoreCase) { "rejected", "revoked", "deleted", "expired" };

            // filter consents to return only active consents
            IEnumerable<ConsentRequestDetails> activeConsents = consents.Value.Where(consent =>
                !consent.ConsentRequestEvents.Any(e => excludedStatuses.Contains(e.EventType))
                && consent.ConsentRequestEvents.Exists(e => e.EventType.Equals("accepted", StringComparison.OrdinalIgnoreCase)));

            // look up all party names in one call instead of one by one
            IEnumerable<string> partyUuids = activeConsents
                .SelectMany(c => new[] { GetUrnValue(c.To), GetUrnValue(c.From) })
                .Where(u => !string.IsNullOrWhiteSpace(u))
                .Distinct(StringComparer.OrdinalIgnoreCase);

            IEnumerable<Party> parties = await GetConsentParties(partyUuids);
            Dictionary<string, Party> partyByUuid = PartyListToDict(parties);

            IEnumerable<ConsentTemplate> consentTemplates = await GetConsentTemplates(cancellationToken);
            
            IEnumerable<ActiveConsentItemFE> activeConsentsFE = activeConsents.Select(consent =>
            {
                partyByUuid.TryGetValue(GetUrnValue(consent.To), out Party toParty);
                return new ActiveConsentItemFE()
                {
                    Id = consent.Id,
                    IsPoa = IsPoaTemplate(consentTemplates, consent.TemplateId),
                    ToPartyId = consent.To,
                    ToPartyName = toParty?.Name ?? string.Empty,
                };
            });
            
            return activeConsentsFE.ToList();
        }

        /// <inheritdoc />
        public async Task<Result<List<ConsentLogItemFE>>> GetConsentLog(Guid party, CancellationToken cancellationToken)
        {
            Result<List<ConsentRequestDetails>> consents = await _consentClient.GetConsentList(party, cancellationToken);
            if (consents.IsProblem)
            {
                return consents.Problem;
            }

            // look up all party names in one call instead of one by one
            IEnumerable<string> partyUuids = consents.Value.Aggregate(new List<string> { }, (acc, consent) =>
            {
                List<string> handledBy = string.IsNullOrEmpty(consent.HandledBy) ? [] : [GetUrnValue(consent.HandledBy)];
                return [.. acc, GetUrnValue(consent.To), GetUrnValue(consent.From), .. handledBy];
            }).Distinct();
            IEnumerable<Party> parties = await GetConsentParties(partyUuids);
            Dictionary<string, Party> partyByUuid = PartyListToDict(parties);
            IEnumerable<ConsentTemplate> consentTemplates = await GetConsentTemplates(cancellationToken);

            IEnumerable<ConsentLogItemFE> consentListItems = consents.Value.Select(consent =>
            {
                partyByUuid.TryGetValue(GetUrnValue(consent.To), out Party toParty);
                partyByUuid.TryGetValue(GetUrnValue(consent.From), out Party fromParty);
                string handledByPartyUuid = string.IsNullOrEmpty(consent.HandledBy) ? string.Empty : GetUrnValue(consent.HandledBy);
                partyByUuid.TryGetValue(handledByPartyUuid, out Party handledByParty);

                return new ConsentLogItemFE()
                {
                    Id = consent.Id,
                    IsPoa = IsPoaTemplate(consentTemplates, consent.TemplateId),
                    ToPartyId = consent.To,
                    ToPartyName = toParty?.Name ?? string.Empty,
                    FromPartyId = consent.From,
                    FromPartyName = fromParty?.Name ?? string.Empty,
                    HandledByPartyId = consent.HandledBy,
                    HandledByPartyName = handledByParty?.Name ?? string.Empty,
                    ValidTo = consent.ValidTo,
                    ConsentRequestEvents = consent.ConsentRequestEvents,
                };
            });
            
            return consentListItems.ToList();
        }

        /// <inheritdoc />
        public async Task<Result<ConsentFE>> GetConsent(Guid consentId, CancellationToken cancellationToken)
        {
            Result<Consent> consent = await _consentClient.GetConsent(consentId, cancellationToken);
            Result<ConsentRequestDetails> request = await _consentClient.GetConsentRequest(consentId, cancellationToken);

            if (consent.IsProblem)
            {
                return consent.Problem;
            }

            ConsentTemplateParams templateParams = new()
            {
                ConsentRights = consent.Value.ConsentRights,
                FromUrn = consent.Value.From,
                ToUrn = consent.Value.To,
                HandledByUrn = consent.Value.HandledBy,
                ValidTo = consent.Value.ValidTo,
                TemplateId = request.Value.TemplateId,
                TemplateVersion = request.Value.TemplateVersion,
                RequestMessage = consent.Value.RequestMessage, // usikker på om vi trenger denne i ConsentFE
            };
            Result<EnrichedConsentTemplate> enrichedConsentTemplate = await EnrichConsentTemplate(templateParams, cancellationToken);

            if (enrichedConsentTemplate.IsProblem)
            {
                return enrichedConsentTemplate.Problem;
            }

            return new ConsentFE()
            {
                Id = consent.Value.Id,
                Rights = enrichedConsentTemplate.Value.Rights,
                IsPoa = enrichedConsentTemplate.Value.IsPoa,
                TitleAccepted = enrichedConsentTemplate.Value.TitleAccepted,
                ServiceIntroAccepted = enrichedConsentTemplate.Value.ServiceIntroAccepted,
                HandledBy = enrichedConsentTemplate.Value.HandledBy,
                ConsentMessage = enrichedConsentTemplate.Value.ConsentMessage,
                Expiration = enrichedConsentTemplate.Value.Expiration,
                ConsentRequestEvents = request.Value.ConsentRequestEvents,
                ValidTo = consent.Value.ValidTo,
            };
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RevokeConsent(Guid consentId, CancellationToken cancellationToken)
        {
            return await _consentClient.RevokeConsent(consentId, cancellationToken);
        }

        private Dictionary<string, string> GetStaticMetadata(Party to, Party from, Party handledBy, DateTimeOffset requestValidTo)
        {
            TimeZoneInfo timeZone = TimeZoneInfo.Utc;
            try
            {
                // attempt to set timezone to norwegian
                timeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Oslo");
            }
            catch (TimeZoneNotFoundException e)
            {
                _logger.LogWarning(e, "Could not find timezone Europe/Oslo. Defaulting to UTC {Message}.", e.Message);
            }

            return new()
            {
                { "CoveredBy", to.Name },
                { "OfferedBy", from.Name },
                { "HandledBy", handledBy?.Name },
                { "Expiration", TimeZoneInfo.ConvertTime(requestValidTo, timeZone).ToString("dd.MM.yyyy HH:mm", CultureInfo.InvariantCulture) }
            };
        }

        private static Dictionary<string, Party> PartyListToDict(IEnumerable<Party> parties)
        {
            return parties.Where(p => p != null && p.PartyUuid.HasValue).ToDictionary(p => p.PartyUuid.ToString(), p => p, StringComparer.OrdinalIgnoreCase);
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
            if (metadata == null || translations == null)
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

        private async Task<IEnumerable<Party>> GetConsentParties(IEnumerable<string> partyUuids)
        {
            IEnumerable<Guid> partyGuidsToLookup = partyUuids
                .Where(urn => urn != null)
                .Select(urn => Guid.TryParse(urn, out var guid) ? guid : (Guid?)null)
                .Where(guid => guid.HasValue)
                .Select(guid => guid.Value)
                .Distinct();

            List<Party> parties = await _registerClient.GetPartyList(partyGuidsToLookup.ToList());

            return parties;
        }

        private async Task<Result<EnrichedConsentTemplate>> EnrichConsentTemplate(ConsentTemplateParams templateParams, CancellationToken cancellationToken)
        {
            // GET all resources in request
            bool isOneTimeConsent = false;
            List<ConsentRightFE> rights = [];
            foreach (ConsentRight right in templateParams.ConsentRights)
            {
                try
                {
                    string resourceId = right.Resource.Find(x => x.Type == "urn:altinn:resource")?.Value;
                    ServiceResource resource = await _resourceRegistryClient.GetResource(resourceId);

                    // If one of the resources is one-time consent, the whole consent is one-time consent
                    isOneTimeConsent = isOneTimeConsent || resource.IsOneTimeConsent;

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
            IEnumerable<ConsentTemplate> consentTemplates = await GetConsentTemplates(cancellationToken);
            ConsentTemplate consentTemplate = consentTemplates.FirstOrDefault((template) =>
                template.Id == templateParams.TemplateId &&
                template.Version == templateParams.TemplateVersion);

            if (consentTemplate == null)
            {
                return ConsentProblem.ConsentTemplateNotFound;
            }

            var expirationText = isOneTimeConsent ? consentTemplate.Texts.ExpirationOneTime : consentTemplate.Texts.Expiration;

            string toPartyUuid = GetUrnValue(templateParams.ToUrn);
            string fromPartyUuid = GetUrnValue(templateParams.FromUrn);
            string handledByPartyUuid = templateParams.HandledByUrn != null ? GetUrnValue(templateParams.HandledByUrn) : null;
            
            IEnumerable<Party> parties = await GetConsentParties([toPartyUuid, fromPartyUuid, handledByPartyUuid]);
            Party toParty = parties.FirstOrDefault(party => party.PartyUuid.ToString() == toPartyUuid);
            Party fromParty = parties.FirstOrDefault(party => party.PartyUuid.ToString() == fromPartyUuid);
            Party handledByParty = parties.FirstOrDefault(party => party.PartyUuid.ToString() == handledByPartyUuid);

            if (toParty == null || fromParty == null)
            {
                return ConsentProblem.ConsentPartyNotFound;
            }

            Dictionary<string, string> staticMetadata = GetStaticMetadata(toParty, fromParty, handledByParty, templateParams.ValidTo);
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
                ConsentMessage = templateParams.RequestMessage ?? ReplaceMetadataInTranslationsDict(consentTemplate.Texts.OverriddenDelegationContext, staticMetadata),
                Expiration = ReplaceMetadataInTranslationsDict(expirationText, staticMetadata),
                FromPartyName = isFromOrg ? fromParty.Name : null
            };
        }

        private async Task<IEnumerable<ConsentTemplate>> GetConsentTemplates(CancellationToken cancellationToken)
        {
            string cacheKey = "consenttemplates";

            if (!_memoryCache.TryGetValue(cacheKey, out IEnumerable<ConsentTemplate> consentTemplates))
            {
                consentTemplates = await _consentClient.GetConsentTemplates(cancellationToken);

                if (consentTemplates is not null)
                {
                    MemoryCacheEntryOptions cacheEntryOptions = new MemoryCacheEntryOptions()
                        .SetPriority(CacheItemPriority.High)
                        .SetAbsoluteExpiration(new TimeSpan(0, _cacheConfig.ResourceRegistryResourceCacheTimeout, 0));

                    _memoryCache.Set(cacheKey, consentTemplates, cacheEntryOptions);
                }
            }

            return consentTemplates;
        }

        private static bool IsPoaTemplate(IEnumerable<ConsentTemplate> consentTemplates, string templateId)
        {
            return consentTemplates.Any((template) => template.Id.Equals(templateId) && template.IsPoa);
        }

        private sealed class ConsentTemplateParams
        {
            public IEnumerable<ConsentRight> ConsentRights { get; set; }

            public string FromUrn { get; set; }

            public string ToUrn { get; set; }

            public string HandledByUrn { get; set; }

            public DateTimeOffset ValidTo { get; set; }

            public string TemplateId { get; set; }

            public int TemplateVersion { get; set; }

            public Dictionary<string, string> RequestMessage { get; set; }
        }
    }
}
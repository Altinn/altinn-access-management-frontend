using System.Collections.Specialized;
using System.Text;
using System.Web;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Consent;
using Altinn.AccessManagement.UI.Core.Models.Consent.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;
using Altinn.Register.Contracts.V1;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class ConsentService : IConsentService
    {
        private readonly IConsentClient _consentClient;
        private readonly IRegisterClient _registerClient;
        private readonly IResourceRegistryClient _resourceRegistryClient;
        private readonly CacheConfig _cacheConfig;
        private readonly IMemoryCache _memoryCache;

        /// <summary>
        /// Initializes a new instance of the <see cref="ConsentService"/> class.
        /// </summary>
        /// <param name="consentClient">The consent client.</param>
        /// <param name="registerClient">The register client.</param>
        /// <param name="resourceRegistryClient">Resources client to load resources</param>
        /// <param name="memoryCache">the handler for cache</param>
        /// <param name="cacheConfig">the handler for cache configuration</param>
        public ConsentService(
            IConsentClient consentClient,
            IRegisterClient registerClient,
            IResourceRegistryClient resourceRegistryClient,
            IMemoryCache memoryCache,
            IOptions<CacheConfig> cacheConfig)
        {
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

            Result<EnrichedConsentTemplate> enrichedConsentTemplate = await EnrichConsentTemplate(request.Value, cancellationToken);

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
                ConsentRequestEvents = request.Value.ConsentRequestEvents,
                ValidTo = request.Value.ValidTo,
                FromParty = enrichedConsentTemplate.Value.FromParty,
                ToParty = enrichedConsentTemplate.Value.ToParty,
                HandledByParty = enrichedConsentTemplate.Value.HandledByParty
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

            // add Status to RedirectUrl
            UriBuilder uriBuilder = new UriBuilder(request.Value.RedirectUrl);
            NameValueCollection queryParams = HttpUtility.ParseQueryString(uriBuilder.Query);

            if (request.Value.ConsentRequestEvents.Any(e => string.Equals(e.EventType, "accepted", StringComparison.OrdinalIgnoreCase)))
            {
                // if consent was approved
                queryParams.Add("Status", "OK");
            }
            else if (request.Value.ConsentRequestEvents.Any(e => string.Equals(e.EventType, "rejected", StringComparison.OrdinalIgnoreCase)))
            {
                // if consent was rejected
                queryParams.Add("Status", "Failed");
                queryParams.Add("ErrorMessage", "User did not give consent");
            }
            
            uriBuilder.Query = queryParams.ToString();
            return uriBuilder.Uri.ToString();
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
            {
                bool isTerminated = consent.ConsentRequestEvents.Any(e => excludedStatuses.Contains(e.EventType));
                bool isAccepted = IsConsentAccepted(consent);
                bool isShownInPortal = IsPortalModeConsent(consent);
                return !isTerminated && (isAccepted || isShownInPortal);
            });

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
                partyByUuid.TryGetValue(GetUrnValue(consent.From), out Party fromParty);
                return new ActiveConsentItemFE()
                {
                    Id = consent.Id,
                    IsPendingConsent = !IsConsentAccepted(consent) && IsPortalModeConsent(consent),
                    IsPoa = IsPoaTemplate(consentTemplates, consent.TemplateId),
                    ToParty = GetConsentParty(consent.To, toParty?.Name),
                    FromParty = GetConsentParty(consent.From, fromParty?.Name),
                    CreatedDate = consent.ConsentRequestEvents.Find(e => string.Equals(e.EventType, "created", StringComparison.OrdinalIgnoreCase))?.Created ?? DateTimeOffset.MinValue,
                    ConsentedDate = consent.ConsentRequestEvents.Find(e => string.Equals(e.EventType, "accepted", StringComparison.OrdinalIgnoreCase))?.Created ?? null
                };
            });

            return activeConsentsFE.Reverse().ToList();
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
            IEnumerable<string> partyUuids = consents.Value
                .SelectMany(consent => new[] { consent.To, consent.From, consent.HandledBy }
                    .Where(urn => !string.IsNullOrEmpty(urn))
                    .Select(urn => GetUrnValue(urn)))
                .Distinct();

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
                    ToParty = GetConsentParty(consent.To, toParty?.Name),
                    FromParty = GetConsentParty(consent.From, fromParty?.Name),
                    HandledByParty = GetConsentParty(consent.HandledBy, handledByParty?.Name),
                    ValidTo = consent.ValidTo,
                    ConsentRequestEvents = consent.ConsentRequestEvents,
                };
            });

            return consentListItems.ToList();
        }

        /// <inheritdoc />
        public async Task<Result<ConsentFE>> GetConsent(Guid consentId, CancellationToken cancellationToken)
        {
            Result<ConsentRequestDetails> request = await _consentClient.GetConsentRequest(consentId, cancellationToken);

            if (request.IsProblem)
            {
                return request.Problem;
            }

            Result<EnrichedConsentTemplate> enrichedConsentTemplate = await EnrichConsentTemplate(request.Value, cancellationToken);

            if (enrichedConsentTemplate.IsProblem)
            {
                return enrichedConsentTemplate.Problem;
            }

            return new ConsentFE()
            {
                Id = request.Value.Id,
                Rights = enrichedConsentTemplate.Value.Rights,
                IsPoa = enrichedConsentTemplate.Value.IsPoa,
                TitleAccepted = enrichedConsentTemplate.Value.TitleAccepted,
                ServiceIntroAccepted = enrichedConsentTemplate.Value.ServiceIntroAccepted,
                HandledBy = enrichedConsentTemplate.Value.HandledBy,
                ConsentMessage = enrichedConsentTemplate.Value.ConsentMessage,
                Expiration = enrichedConsentTemplate.Value.Expiration,
                ConsentRequestEvents = request.Value.ConsentRequestEvents,
                ValidTo = request.Value.ValidTo,
                FromParty = enrichedConsentTemplate.Value.FromParty,
                ToParty = enrichedConsentTemplate.Value.ToParty,
                HandledByParty = enrichedConsentTemplate.Value.HandledByParty
            };
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RevokeConsent(Guid consentId, CancellationToken cancellationToken)
        {
            return await _consentClient.RevokeConsent(consentId, cancellationToken);
        }

        private static Dictionary<string, Party> PartyListToDict(IEnumerable<Party> parties)
        {
            return parties.Where(p => p != null && p.PartyUuid.HasValue).ToDictionary(p => p.PartyUuid.ToString(), p => p, StringComparer.OrdinalIgnoreCase);
        }

        private static bool IsPortalModeConsent(ConsentRequestDetails consentRequest)
        {
            return string.Equals(consentRequest.PortalViewMode, "show", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsConsentAccepted(ConsentRequestDetails consentRequest)
        {
            return consentRequest.ConsentRequestEvents.Any(e => string.Equals(e.EventType, "accepted", StringComparison.OrdinalIgnoreCase));
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

        private async Task<Result<EnrichedConsentTemplate>> EnrichConsentTemplate(ConsentRequestDetails request, CancellationToken cancellationToken)
        {
            // GET all resources in request
            bool isOneTimeConsent = false;
            List<ConsentRightFE> rights = [];
            foreach (ConsentRight right in request.ConsentRights)
            {
                try
                {
                    ConsentResourceAttribute consentResource = right.Resource.Find(x => x.Type == "urn:altinn:resource");
                    ServiceResource resource = await _resourceRegistryClient.GetResource(consentResource.Value, consentResource.Version);

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
                template.Id == request.TemplateId &&
                template.Version == request.TemplateVersion);

            if (consentTemplate == null)
            {
                return ConsentProblem.ConsentTemplateNotFound;
            }

            var expirationText = isOneTimeConsent ? consentTemplate.Texts.ExpirationOneTime : consentTemplate.Texts.Expiration;

            string toPartyUuid = GetUrnValue(request.To);
            string fromPartyUuid = GetUrnValue(request.From);
            string handledByPartyUuid = request.HandledBy != null ? GetUrnValue(request.HandledBy) : null;

            IEnumerable<Party> parties = await GetConsentParties([toPartyUuid, fromPartyUuid, handledByPartyUuid]);
            Party toParty = parties.FirstOrDefault(party => party.PartyUuid.ToString() == toPartyUuid);
            Party fromParty = parties.FirstOrDefault(party => party.PartyUuid.ToString() == fromPartyUuid);
            Party handledByParty = parties.FirstOrDefault(party => party.PartyUuid.ToString() == handledByPartyUuid);

            if (toParty == null || fromParty == null)
            {
                return ConsentProblem.ConsentPartyNotFound;
            }

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
                Title = title,
                Heading = heading,
                ServiceIntro = serviceIntro,
                ServiceIntroAccepted = serviceIntroAccepted,
                TitleAccepted = consentTemplate.Texts.TitleAccepted,
                HandledBy = handledByParty != null ? consentTemplate.Texts.HandledBy : null,
                ConsentMessage = request.RequestMessage ?? consentTemplate.Texts.OverriddenDelegationContext,
                Expiration = expirationText,
                FromParty = GetConsentParty(request.From, fromParty.Name),
                ToParty = GetConsentParty(request.To, toParty.Name),
                HandledByParty = GetConsentParty(request.HandledBy, handledByParty?.Name),
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

        private static AuthorizedPartyType GetPartyOrgType(string partyId)
        {
            return partyId.Contains("urn:altinn:person") ? AuthorizedPartyType.Person : AuthorizedPartyType.Organization;
        }

        private static ConsentPartyFE GetConsentParty(string partyId, string partyName)
        {
            if (string.IsNullOrEmpty(partyId))
            {
                return null;
            }
            
            return new ConsentPartyFE()
            {
                Id = partyId,
                Name = partyName ?? string.Empty,
                Type = GetPartyOrgType(partyId)
            };
        }
    }
}

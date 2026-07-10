using System.Collections.Concurrent;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.DelegationExport;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// The <see cref="DelegationExportController"/> provides an endpoint for downloading an
    /// overview of rights (roles, access packages and single rights) delegated from a
    /// virksomhet and its underenheter to persons and organizations, as a zip of CSV files.
    /// </summary>
    [Route("accessmanagement/api/v1/delegationexport")]
    public class DelegationExportController : Controller
    {
        private static readonly HashSet<string> AllowedTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "roles", "accesspackages", "singlerights", "instances",
        };

        private static readonly ConcurrentDictionary<int, byte> _activeExports = new();

        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly IDelegationExportService _delegationExportService;

        /// <summary>
        /// Initializes a new instance of the <see cref="DelegationExportController"/> class.
        /// </summary>
        /// <param name="httpContextAccessor">The HTTP context accessor.</param>
        /// <param name="logger">The logger.</param>
        /// <param name="delegationExportService">The delegation export service.</param>
        public DelegationExportController(
            IHttpContextAccessor httpContextAccessor,
            ILogger<DelegationExportController> logger,
            IDelegationExportService delegationExportService)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _delegationExportService = delegationExportService;
        }

        /// <summary>
        /// Downloads a zip of CSV files describing the rights delegated from the given reportee
        /// (and optionally its subunits) to persons and organizations.
        /// </summary>
        /// <param name="partyUuid">The reportee (virksomhet) to export for.</param>
        /// <param name="includeSubunits">Whether to include delegations from the reportee's subunits (default false).</param>
        /// <param name="types">Optional comma-separated list of types to include (roles,accesspackages,singlerights,instances). Default all.</param>
        /// <param name="languageCode">Optional language code for resolved names. Falls back to the selected-language cookie, then bokmål.</param>
        /// <returns>A zip file, or an error status.</returns>
        [HttpGet]
        [Authorize]
        [Route("")]
        public async Task<ActionResult> ExportReporteeDelegations(
            [FromQuery] Guid partyUuid,
            [FromQuery] bool includeSubunits = false,
            [FromQuery] string types = null,
            [FromQuery] string languageCode = null)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (partyUuid == Guid.Empty)
            {
                return BadRequest("partyUuid must be provided.");
            }

            int userId = AuthenticationHelper.GetUserId(_httpContextAccessor.HttpContext);
            if (userId == 0)
            {
                return BadRequest("The userId is not provided in the context.");
            }

            if (!_activeExports.TryAdd(userId, 0))
            {
                return StatusCode(StatusCodes.Status429TooManyRequests, "An export is already in progress. Please wait for it to complete.");
            }

            try
            {
                ISet<string> typeSet = ParseTypes(types);
                if (typeSet != null)
                {
                    List<string> unknown = typeSet.Where(t => !AllowedTypes.Contains(t)).ToList();
                    if (unknown.Count > 0)
                    {
                        return BadRequest($"Unknown type(s): {string.Join(", ", unknown)}. Allowed: {string.Join(", ", AllowedTypes)}.");
                    }
                }

                string language = string.IsNullOrWhiteSpace(languageCode)
                    ? LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext)
                    : languageCode;

                DelegationExportResult result = await _delegationExportService.ExportReporteeDelegations(partyUuid, includeSubunits, typeSet, language);

                switch (result.Status)
                {
                    case DelegationExportStatus.Ok:
                        return File(result.Content, "application/zip", result.FileName);
                    case DelegationExportStatus.NotOrganization:
                        return BadRequest("Delegation export is only available when the party is an organization.");
                    case DelegationExportStatus.PartyNotFound:
                    default:
                        return StatusCode(StatusCodes.Status403Forbidden, "The party was not found in your list of reportees.");
                }
            }
            catch (HttpStatusException ex)
            {
                _logger.LogError(ex, "Unexpected HTTP status from backend when exporting delegated rights for party {PartyUuid}", partyUuid);
                return StatusCode((int)ex.StatusCode, $"Unexpected httpStatus returned from backend ({ex.Title})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting delegated rights for party {PartyUuid}", partyUuid);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while building the export.");
            }
            finally
            {
                _activeExports.TryRemove(userId, out _);
            }
        }

        private static ISet<string> ParseTypes(string types)
        {
            if (string.IsNullOrWhiteSpace(types))
            {
                return null;
            }

            return types
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(t => t.ToLowerInvariant())
                .ToHashSet();
        }
    }
}

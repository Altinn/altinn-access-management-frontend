using System.Text.Json;
using Altinn.AccessManagement.Core.UI.Enums;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Tests.Controllers;
using Altinn.Authorization.ABAC.Constants;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Tests.Utils
{
    /// <summary>
    /// Mock class for helping setup test data
    /// </summary>
    public static class TestDataUtil
    {
        /// <summary>
        /// Gets a list of service resources
        /// </summary>
        /// <param name="resourceType">the resource type.</param>
        /// <returns>Returns thelist of service resources.</returns>
        public static List<ServiceResourceFE> GetResources(ResourceType resourceType)
        {
            List<ServiceResourceFE> resources = new List<ServiceResourceFE>();
            List<ServiceResourceFE> filteredResources = null;

            string path = GetResourcesPath();
            if (Directory.Exists(path))
            {
                string[] files = Directory.GetFiles(path);

                foreach (string file in files)
                {
                    if (file.Contains("resources"))
                    {
                        string content = File.ReadAllText(Path.Combine(path, file));
                        var options = new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true,
                        };
                        resources = JsonSerializer.Deserialize<List<ServiceResourceFE>>(content, options);
                    }
                }

                filteredResources = resources.FindAll(r => r.ResourceType == resourceType);
            }

            return filteredResources;
        }

        /// <summary>
        /// Sets up mock data for delegation list 
        /// </summary>
        /// <param name="offeredByPartyId">partyid of the reportee that delegated the resource</param>
        /// <param name="coveredByPartyId">partyid of the reportee that received the delegation</param>
        /// <param name="resourceIds">resource id</param>
        /// <returns>Received delegations</returns>
        public static List<Delegation> GetDelegations(int offeredByPartyId, int coveredByPartyId, List<string> resourceIds = null)
        {
            List<Delegation> delegations = null;
            List<Delegation> filteredDelegations = new List<Delegation>();
            string fileName;

            if (resourceIds != null)
            {
                fileName = "admindelegations";
            }
            else
            {
                fileName = offeredByPartyId != 0 ? "outbounddelegation" : "inbounddelegation";
            }
            
            string path = GetDelegationPath();
            if (Directory.Exists(path))
            {
                string[] files = Directory.GetFiles(path);

                foreach (string file in files)
                {
                    if (file.Contains(fileName))
                    {
                        string content = File.ReadAllText(Path.Combine(path, file));
                        var options = new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true,
                        };
                        try
                        {
                            delegations = JsonSerializer.Deserialize<List<Delegation>>(content, options);
                        }
                        catch (Exception ex)
                        { 
                            Console.WriteLine(ex);
                        }
                    }
                }

                if (offeredByPartyId != 0 && coveredByPartyId != 0)
                {
                    filteredDelegations.AddRange(delegations?.FindAll(od => od.OfferedByPartyId == offeredByPartyId && od.CoveredByPartyId == coveredByPartyId && resourceIds.Contains(od.ResourceId)));
                }
                else if (offeredByPartyId != 0)
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.OfferedByPartyId == offeredByPartyId));
                }
                else if (coveredByPartyId != 0)
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.CoveredByPartyId == coveredByPartyId));
                }
            }

            return filteredDelegations;
        }

        /// <summary>
        /// Sets up mock data for delegation list 
        /// </summary>
        /// <param name="offeredByPartyId">partyid of the reportee that delegated the resource</param>
        /// <param name="coveredByPartyId">partyid of the reportee that received the delegation</param>
        /// <param name="resourceIds">resource id</param>
        /// <returns>Received delegations</returns>
        public static List<DelegationsFE> GetDelegationsFE(int offeredByPartyId, int coveredByPartyId, List<string> resourceIds = null)
        {
            List<DelegationsFE> delegations = null;
            List<DelegationsFE> filteredDelegations = new List<DelegationsFE>();
            string fileName;

            if (resourceIds != null)
            {
                fileName = "admindelegations";
            }
            else
            {
                fileName = offeredByPartyId != 0 ? "outbounddelegationfe" : "inbounddelegationfe";
            }

            string path = GetDelegationPath();
            if (Directory.Exists(path))
            {
                string file = $"{fileName}.json";

                //foreach (string file in files)
                //{
                //    if (file.Contains(fileName))
                //    {
                        string content = File.ReadAllText(Path.Combine(path, file));
                        var options = new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true,
                        };
                        try
                        {
                            delegations = JsonSerializer.Deserialize<List<DelegationsFE>>(content, options);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex);
                        }
                //    }
                //}

                if (offeredByPartyId != 0 && coveredByPartyId != 0)
                {
                    filteredDelegations.AddRange(delegations?.FindAll(od => od.OfferedByPartyId == offeredByPartyId && od.CoveredByPartyId == coveredByPartyId && resourceIds.Contains(od.ResourceId)));
                }
                else if (offeredByPartyId != 0)
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.OfferedByPartyId == offeredByPartyId));
                }
                else if (coveredByPartyId != 0)
                {
                    filteredDelegations.AddRange(delegations.FindAll(od => od.CoveredByPartyId == coveredByPartyId));
                }
            }

            return filteredDelegations;
        }

        private static string GetDelegationPath()
        {
            string? unitTestFolder = Path.GetDirectoryName(new Uri(typeof(DelegationsControllerTest).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "..", "..", "..", "Data", "Delegation");
        }

        private static string GetResourcesPath()
        {
            string? unitTestFolder = Path.GetDirectoryName(new Uri(typeof(DelegationsControllerTest).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "..", "..", "..", "Data", "Resources");
        }
    }
}

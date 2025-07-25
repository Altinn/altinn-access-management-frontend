namespace Altinn.AccessManagement.UI.Core.Configuration
{
    /// <summary>
    /// Settings for enabling mocking of data
    /// </summary>
    public class MockSettings
    {
        /// <summary>
        /// Set to mock PDP during runtime
        /// </summary>
        public bool PDP { get; set; }

        /// <summary>
        /// Set to mock AccessManagementClient during runtime
        /// </summary>
        public bool AccessManagement { get; set; }

        /// <summary>
        /// Set to mock AccessManagementClientV0 during runtime
        /// </summary>
        public bool AccessManagement_V0 { get; set; }

        /// <summary>
        /// Set to mock AccessPackageClient during runtime
        /// </summary>
        public bool AccessPackage { get; set; }

        /// <summary>
        /// Set to mock RightHolderClient during runtime
        /// </summary>
        public bool RightHolder { get; set; }

        /// <summary>
        /// Set to mock ProfileClient during runtime
        /// </summary>
        public bool Profile { get; set; }

        /// <summary>
        /// Set to mock RegisterClient during runtime
        /// </summary>
        public bool Register { get; set; }

        /// <summary>
        /// Set to mock ResourceRegistryClient during runtime
        /// </summary>
        public bool ResourceRegistry { get; set; }

        /// <summary>
        /// Set to run KeyVaultService locally during runtime
        /// </summary>
        public bool KeyVault { get; set; }

        /// <summary>
        /// Set to run SystemRegisterClient locally during runtime
        /// </summary>
        public bool SystemRegister { get; set; }

        /// <summary>
        /// Set to run SystemUserClient locally during runtime
        /// </summary>
        public bool SystemUser { get; set; }

        /// <summary>
        /// Set to run SystemUserAgentDelegationClient locally during runtime
        /// </summary>
        public bool SystemUserAgentDelegation { get; set; }

        /// <summary>
        /// Set to run ConsentClient locally during runtime
        /// </summary>
        public bool Consent { get; set; }

        /// <summary>
        /// Set to run AltinnCdnClient locally during runtime
        /// </summary>
        public bool AltinnCdn { get; set; }

        /// <summary>
        /// Default constructor
        /// </summary>
        public MockSettings()
        {
        }

        /// <summary>
        /// Constructor for setting all members to the same value
        /// </summary>
        /// <param name="value">The boolean value to which all memebers will be set</param>
        public MockSettings(bool value)
        {
            AccessManagement = AccessManagement_V0 = AccessPackage = Profile = Register = ResourceRegistry = KeyVault = value;
        }
    }
}
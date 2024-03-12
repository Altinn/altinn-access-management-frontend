using System.Diagnostics.CodeAnalysis;
using System.Text;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Wrapper implementation for a KeyVaultClient. The wrapped client is created with a principal obtained through configuration.
    /// </summary>
    /// <remarks>This class is excluded from code coverage because it has no logic to be tested.</remarks>
    [ExcludeFromCodeCoverage]
    public class LocalKeyVaultService : IKeyVaultService
    {
        /// <inheritdoc/>
        public async Task<string> GetCertificateAsync(string vaultUri, string secretId)
        {
            string certBase64 = Convert.ToBase64String(Encoding.ASCII.GetBytes("-----BEGIN CERTIFICATE-----\r\nMIIDAzCCAeugAwIBAgIJANTdO8o3I8x5MA0GCSqGSIb3DQEBCwUAMA4xDDAKBgNV\r\nBAMTA3R0ZDAeFw0yMDA1MjUxMjIxMzdaFw0zMDA1MjQxMjIxMzdaMA4xDDAKBgNV\r\nBAMTA3R0ZDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMcfTsXwwLyC\r\nUkIz06eadWJvG3yrzT+ZB2Oy/WPaZosDnPcnZvCDueN+oy0zTx5TyH5gCi1FvzX2\r\n7G2eZEKwQaRPv0yuM+McHy1rXxMSOlH/ebP9KJj3FDMUgZl1DCAjJxSAANdTwdrq\r\nydVg1Crp37AQx8IIEjnBhXsfQh1uPGt1XwgeNyjl00IejxvQOPzd1CofYWwODVtQ\r\nl3PKn1SEgOGcB6wuHNRlnZPCIelQmqxWkcEZiu/NU+kst3NspVUQG2Jf2AF8UWgC\r\nrnrhMQR0Ra1Vi7bWpu6QIKYkN9q0NRHeRSsELOvTh1FgDySYJtNd2xDRSf6IvOiu\r\ntSipl1NZlV0CAwEAAaNkMGIwIAYDVR0OAQH/BBYEFIwq/KbSMzLETdo9NNxj0rz4\r\nqMqVMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgWgMCAGA1UdJQEB/wQWMBQG\r\nCCsGAQUFBwMBBggrBgEFBQcDAjANBgkqhkiG9w0BAQsFAAOCAQEAE56UmH5gEYbe\r\n1kVw7nrfH0R9FyVZGeQQWBn4/6Ifn+eMS9mxqe0Lq74Ue1zEzvRhRRqWYi9JlKNf\r\n7QQNrc+DzCceIa1U6cMXgXKuXquVHLmRfqvKHbWHJfIkaY8Mlfy++77UmbkvIzly\r\nT1HVhKKp6Xx0r5koa6frBh4Xo/vKBlEyQxWLWF0RPGpGErnYIosJ41M3Po3nw3lY\r\nf7lmH47cdXatcntj2Ho/b2wGi9+W29teVCDfHn2/0oqc7K0EOY9c2ODLjUvQyPZR\r\nOD2yykpyh9x/YeYHFDYdLDJ76/kIdxN43kLU4/hTrh9tMb1PZF+/4DshpAlRoQuL\r\no8I8avQm/A==\r\n-----END CERTIFICATE-----"));
            return certBase64;
        }
    }
}

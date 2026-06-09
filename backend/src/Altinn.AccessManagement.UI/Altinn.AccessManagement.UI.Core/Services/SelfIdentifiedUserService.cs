using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SelfIdentifiedUser;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SelfIdentifiedUserService : ISelfIdentifiedUserService
    {
        private readonly ISelfIdentifiedUserClient _selfIdentifiedUserClient;
        private readonly IConnectionClient _connectionClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SelfIdentifiedUserService"/> class.
        /// </summary>
        public SelfIdentifiedUserService(ISelfIdentifiedUserClient selfIdentifiedUserClient, IConnectionClient connectionClient)
        {
            _selfIdentifiedUserClient = selfIdentifiedUserClient;
            _connectionClient = connectionClient;
        }

        /// <inheritdoc />
        public async Task<Guid> ValidateCredentials(Altinn2AccountRequest request, CancellationToken cancellationToken)
        {
            return await _selfIdentifiedUserClient.ValidateCredentials(request, cancellationToken);
        }

        /// <inheritdoc />
        public async Task PostNewSelfIdentifiedUser(Guid from, Guid to, CancellationToken cancellationToken)
        {
            await _connectionClient.PostNewSelfIdentifiedUser(from, to, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<string> SendForgotPasswordEmail(Altinn2ForgotPasswordRequest request, CancellationToken cancellationToken)
        {
            string result = await _selfIdentifiedUserClient.SendForgotPasswordEmail(request, cancellationToken);
            return MaskEmail(result);
        }

        /// <inheritdoc />
        public async Task<Guid> AddAltinn2AccountFromToken(Altinn2AccountFromTokenRequest request, CancellationToken cancellationToken)
        {
            return await _selfIdentifiedUserClient.AddAltinn2AccountFromToken(request, cancellationToken);
        }

        private static string MaskEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return email;
            }

            var atIndex = email.IndexOf('@');
            if (atIndex < 0)
            {
                return email;
            }

            var localPart = email[..atIndex];
            var domainPart = email[atIndex..];

            // If local part is short (less than 5 characters), show full email
            if (localPart.Length < 5)
            {
                return email;
            }

            // Keep first 2 and last 2 characters, mask the rest
            var firstTwo = localPart[..2];
            var lastTwo = localPart[^2..];
            var maskedMiddle = new string('*', localPart.Length - 4);

            return $"{firstTwo}{maskedMiddle}{lastTwo}{domainPart}";
        }
    }
}

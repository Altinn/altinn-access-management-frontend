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
    }
}

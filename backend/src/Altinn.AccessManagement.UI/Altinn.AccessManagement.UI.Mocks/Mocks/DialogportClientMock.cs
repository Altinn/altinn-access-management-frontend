using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Dialogporten;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IDialogportClient"/> interface.
    /// </summary>
    public class DialogportClientMock : IDialogportClient
    {
        private readonly string _dataFolder;

        /// <summary>
        /// Initializes a new instance of the <see cref="DialogportClientMock"/> class.
        /// </summary>
        public DialogportClientMock()
        {
            _dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(DialogportClientMock).Assembly.Location).LocalPath), "Data", "Dialogporten", "DialogLookup");
        }

        /// <inheritdoc />
        public Task<DialogLookup> GetDialogLookupByInstanceRef(string authorizationToken, string languageCode, string instanceRef)
        {
            string fileName = instanceRef[(instanceRef.LastIndexOf('/') + 1)..];
            string path = Path.Combine(_dataFolder, $"{fileName}.json");

            if (!File.Exists(path))
            {
                return Task.FromResult(new DialogLookup { Status = DialogLookupStatus.NotFound });
            }

            return Task.FromResult(Util.GetMockData<DialogLookup>(path));
        }
    }
}

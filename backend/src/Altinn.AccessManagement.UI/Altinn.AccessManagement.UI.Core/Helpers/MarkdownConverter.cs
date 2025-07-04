using Markdig;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Utils for converting markdown text to HTML
    /// </summary>
    public static class MarkdownConverter
    {
        /// <summary>
        /// Convert markdown text to HTML
        /// </summary>
        public static string ConvertToHtml(string markdown)
        {
            return Markdown.ToHtml(markdown);
        }
    }
}

namespace Altinn.AccessManagement.UI.Core.Exceptions
{
    /// <summary>
    /// Exception thrown when a required resource cannot be found.
    /// </summary>
    public class ResourceNotFoundException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ResourceNotFoundException"/> class.
        /// </summary>
        /// <param name="message">The error message.</param>
        public ResourceNotFoundException(string message) : base(message)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ResourceNotFoundException"/> class.
        /// </summary>
        /// <param name="message">The error message.</param>
        /// <param name="innerException">The inner exception.</param>
        public ResourceNotFoundException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}

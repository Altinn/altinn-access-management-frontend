namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess
{
    /// <summary>
    /// </summary>
    /// <param name="Type">Type of error</param>
    /// <param name="Title">Title of error</param>
    /// <param name="Status">Http status code</param>
    /// <param name="Instance">Instance of error</param>
    /// <param name="Detail">Detail of error</param>
    /// <param name="AdditionalProp1">Extra prop that says something about the error</param>
    /// <param name="AdditionalProp2">Extra prop that says something about the error</param>
    /// <param name="AdditionalProp3">Extra prop that says something about the error</param>
    public record HttpErrorResponse(string Type, string Title, int Status, string Instance, string Detail, string AdditionalProp1, string AdditionalProp2, string AdditionalProp3);

}

/**
 * Represents the delegation input data transfer object.
 */
export class CheckDelegationAccessDto {
  /**
   * Specifies the 'to' property containing the ID and value.
   */
  to: {
    /**
     * The Altinn ID of what field etc. That is used to be delegated access to.
     */
    id: string;
    /**
     * The ID value of the field that is used to be delegated access to.
     */
    value: string;
  };

  /**
   * Represents an array of resource objects.
   */
  resource: {
    /**
     * The Altinn ID of what field etc. of the thing that's going to be delegated.
     */
    id: string;
    /**
     * The ID value of the specific thing that's going to be delegated.
     */
    value: string;
  };

  /**
   * Initializes a new instance of the DelegationInputDto class.
   * @param toId The Altinn ID of the 'to' property.
   * @param toValue The value of the 'to' property.
   * @param resourceId The Altinn ID of the single resource.
   * @param resourceValue The ID value of the single resource.
   */
  constructor(toId: string, toValue: string, resourceId: string, resourceValue: string) {
    this.to = { id: toId, value: toValue };
    this.resource = { id: resourceId, value: resourceValue };
  }
}

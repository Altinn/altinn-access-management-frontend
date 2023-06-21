/**
 * Represents the delegation input data transfer object.
 */
export interface DelegationInputDto {
  /**
   * Specifies the 'to' property containing the ID and value.
   */
  to: {
    /**
     * The Altinn ID of what field etc. That is used to be delegated access to.
     */
    Id: string;
    /**
     * The ID value of the field that is used to be delegated access to.
     */
    Value: string;
  };
  /**
   * Represents an array of resource objects.
   */
  resource: Array<{
    /**
     * The Altinn ID of what field etc. of the thing that's going to be delegated.
     */
    Id: string;
    /**
     * The ID value of the specific thing that's going to be delegated.
     */
    Value: string;
  }>;
}

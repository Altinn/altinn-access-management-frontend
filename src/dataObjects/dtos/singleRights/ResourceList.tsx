/**
 * Represents a list of Resources that's sent in to backend to enable backend to identify the resource.
 */
export class ResourceList {
  /**
   * Represents an array of resource objects.
   */
  resource: Array<{
    /**
     * The Altinn ID of what field etc. of the thing that's going to be delegated.
     */
    id: string;
    /**
     * The ID value of the specific thing that's going to be delegated.
     */
    value: string;
  }>;

  /**
   * Initializes a new instance of the DelegationInputDto class.
   * @param resourceId The Altinn ID of the single resource.
   * @param resourceValue The ID value of the single resource.
   */
  constructor(resourceId: string, resourceValue: string) {
    this.resource = [{ id: resourceId, value: resourceValue }];
  }
}

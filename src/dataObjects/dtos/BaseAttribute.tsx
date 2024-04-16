// This model describes an attribute, like a resource, a user, a party or an action. The attribute is defined by its type (usually a urn) and it's value.
export class BaseAttribute {
  type: string;
  value: string;

  constructor(type: string, value: string) {
    this.type = type;
    this.value = value;
  }
}

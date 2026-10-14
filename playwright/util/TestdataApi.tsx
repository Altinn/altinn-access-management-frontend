export class TestdataApi {
  static generateExternalRef() {
    const randomString = Date.now(); // Current timestamp in milliseconds
    const randomNum = Math.random().toString(36);
    return `${randomNum}${randomString}`;
  }
}

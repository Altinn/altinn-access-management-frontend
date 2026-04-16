import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests'; // Adjust the path based on your project structure

export class TestdataApi {
  static async removeSystem(vendorOrgNo: string, systemName: string) {
    const api = new ApiRequests();
    await api.deleteSystemInSystemRegister(vendorOrgNo, systemName);
  }

  static generateExternalRef() {
    const randomString = Date.now(); // Current timestamp in milliseconds
    const randomNum = Math.random().toString(36);
    return `${randomNum}${randomString}`;
  }
}

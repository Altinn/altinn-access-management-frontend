import { randomUUID } from 'crypto';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests'; // Adjust the path based on your project structure

export class TestdataApi {
  static async removeSystem(vendorOrgNo: string, systemName: string) {
    const api = new ApiRequests();
    await api.deleteSystemInSystemRegister(vendorOrgNo, systemName);
  }

  static generateExternalRef() {
    // crypto.randomUUID (ikke Math.random): externalRef flyter inn i system-
    // bruker-API-kall, så CodeQL flagger Math.random her som insecure-randomness.
    // UUID gir også bedre unikhet ved parallelle kjøringer enn tidsstempel alene.
    return `${randomUUID()}${Date.now()}`;
  }
}

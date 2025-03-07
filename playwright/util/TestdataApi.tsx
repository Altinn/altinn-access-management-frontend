import { ApiRequests } from '../api-requests/ApiRequests'; // Adjust the path based on your project structure

export class TestdataApi {
  static async removeAllSystemUsers() {
    const api = new ApiRequests();

    try {
      //cleanup method, dont fail test if this fails but log it
      const resp = await api.getSystemUsers();
      const users = JSON.parse(resp);

      if (users.length > 0) {
        await api.cleanUpSystemUsers(users);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  static async removeSystem(systemName: string) {
    const api = new ApiRequests();
    await api.deleteSystemInSystemRegister(systemName);
  }

  static generateExternalRef() {
    const randomString = Date.now(); // Current timestamp in milliseconds
    const randomNum = Math.random().toString(36);
    return `${randomNum}${randomString}`;
  }
}

export class Util {
  private static swapDomain(oldUrl: string): string {
    return oldUrl.replace(/authn\.ui\.(.*?)\.altinn\.(no|cloud)/, 'am.ui.$1.altinn.$2');
  }

  public static useAccessManagementUrlChangeRequest(oldUrl: string): string {
    return this.swapDomain(oldUrl).replace(
      '/authfront/ui/auth/vendorchangerequest',
      '/accessmanagement/ui/systemuser/changerequest',
    );
  }

  public static useAccessManagementUrlSystemUserRequest(oldUrl: string): string {
    return this.swapDomain(oldUrl).replace(
      '/authfront/ui/auth/vendorrequest',
      '/accessmanagement/ui/systemuser/request',
    );
  }
}

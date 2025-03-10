export class Util {
  public static useAccessManagementUrlChangeRequest(oldUrl: string): string {
    return oldUrl
      .replace('authn.ui.tt02', 'am.ui.tt02')
      .replace(
        '/authfront/ui/auth/vendorchangerequest',
        '/accessmanagement/ui/systemuser/changerequest',
      );
  }

  public static useAccessManagementUrlSystemUserRequest(oldUrl: string): string {
    return oldUrl
      .replace('authn.ui.tt02', 'am.ui.tt02')
      .replace('/authfront/ui/auth/vendorrequest', '/accessmanagement/ui/systemuser/request');
  }
}

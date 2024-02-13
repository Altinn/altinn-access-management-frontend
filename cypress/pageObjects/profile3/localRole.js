export const localRole = {
  addNewlocalRole: "[data-url='/ui/AccessManagement/LocalRole/?roleID=0']",
  editLocalRole: '#DirectRoles-View-Actor .list-icon-container',
  editLocalRoleBtnInRolesListPage: "[data-url^='/ui/AccessManagement/LocalRole/?roleID=']",
  localRoleForm: {
    localRoleFormid: '#LocalRoleForm',
    roleName: '#LocalRoleModel_RoleName',
    serviceListSearchBtn: '#serviceListIdInputlocalRoleSearch',
    searchResultsForService: '#serviceListIdInputlocalRoleSearchContainer',
    selectServiceFromListBtn: '#serviceListIdInputlocalRoleSearchContainer > ul > li',
    sign: 'button[title="Signer"]',
    localRoleCreateButton: '#localRoleSubmitButton',
    localRoleReceiptPageHeader: '.modal-body.a-modal-body',
    backToRolesOverviewBtn: '.modal-body > .a-btn.mr-1',
    ferdigBtn: '.modal-body > .a-btn-success.mr-1',
    deleteLocalRoleBtn: "[data-url^='/ui/AccessManagement/DeleteLocalRole/?roleID=']",
  },
};

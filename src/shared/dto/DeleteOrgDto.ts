import type { ApiListItem } from '@/rtk/features/overviewOrg/overviewOrgSlice';

import { DeleteOrgApiDto } from './DeleteOrgItemDto';

export class DeleteOrgDto {
  id: string;
  name: string;
  deletedApis!: DeleteOrgApiDto[];
  constructor(id: string, name: string, overviewListItems: ApiListItem[]) {
    this.id = id;
    this.name = name;
    this.deletedApis = [];
    for (let i = 0; i < overviewListItems.length; i++) {
      const item = new DeleteOrgApiDto(overviewListItems[i].id, overviewListItems[i].apiName);
      this.deletedApis.push(item);
    }
  }
}

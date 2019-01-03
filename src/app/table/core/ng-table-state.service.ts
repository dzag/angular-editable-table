import { Injectable } from '@angular/core';
import { TableConfigurations } from './table-configurations';
import { TableData } from '@app/table';

@Injectable()
export class NgTableState {

  configurations: TableConfigurations;
  data: TableData;

  isEditing: boolean;

  constructor () {
  }

  get showIndex() {
    return this.configurations.states.index.show;
  }

  get showActions() {
    return this.configurations.states.actions.length > 0;
  }

}

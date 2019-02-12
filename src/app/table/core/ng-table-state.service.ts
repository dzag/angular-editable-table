import { Injectable } from '@angular/core';
import { TableConfigurations } from './table-configurations';
import { TableData } from './table-data';
import { TableConfigs } from './table.models';

@Injectable()
export class NgTableState {

  configurations: TableConfigurations;
  data: TableData;

  isEditing: boolean;

  constructor () {
  }

  get configStates(): TableConfigs {
    return this.configurations.states;
  }

  get showIndex() {
    return this.configurations.states.index.show;
  }

  get showActions() {
    return this.configurations.states.actions.length > 0;
  }

}

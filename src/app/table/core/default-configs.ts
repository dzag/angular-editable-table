import { TableActionConfiguration, TableColumnConfigurations } from './table-configurations';
import { tableActions } from './table-actions';

export const DEFAULT_CONFIGS = {
  column: {
    dataType: 'text',
    editable: false,
  } as Partial<TableColumnConfigurations>,
  action: {
    show: true,
    types: tableActions,
  } as TableActionConfiguration,
  index: {
    show: true,
  }
};

import { tableActions } from './table-actions';
import { TableActionConfiguration, TableColumnConfigurations, TableIndexConfiguration, TableRowGroupsConfiguration } from './table.models';

export const DEFAULT_CONFIGS = {
  column: {
    dataType: 'text',
    editable: false,
    subHeaderClass: 'text-center font-italic',
  } as Partial<TableColumnConfigurations>,
  action: {
    show: true,
    types: tableActions,
    class: 'fix-w-50 text-center',
    static: [],
  } as Partial<TableActionConfiguration>,
  index: {
    show: true,
    class: 'text-center fix-w-40',
    subHeaderClass: 'text-center font-italic fix-w-40'
  } as Partial<TableIndexConfiguration>,
  rowGroup: {
    orders: 'asc',
    namespan: 1,
  } as Partial<TableRowGroupsConfiguration>,
  editing: {
    enabled: true,
    allowAdding: false,
    generateIdentifier: false,
  },
  paging: {
    enabled: false,
    metadata: false,
    totalRecords: 1,
    pageNumber: 1,
    pageSize: 10,
    onPageChanged: () => {}
  },
  rowIdentifier: 'id'
};

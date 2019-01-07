import { TableData } from './table-data';

export type DataType = 'text' | 'textarea' | 'select' | 'date' | 'buttons' | 'link' | 'checkbox' | 'number' | 'currency';

export interface SelectOption {
  id?: number;
  value?: string;
}

export interface CustomConfigs {
  [p: string]: any;
}

export type IndexPatternFn = (currentIndex: number, parent?: {parentIndex: number, parentText: string}) => string;
export type IndexType = 'romanNumeral' | 'alphabet';

export interface TableColumnConfigurations extends CustomConfigs {
  prop?: string;
  name?: string;
  dataType: string;
  editable?: boolean;
  editableWhen?: (row) => boolean;
  headerClass?: string;
  dataClass?: string;
  subHeader?: string;
  subHeaderClass?: string;
  options?: any[]; // for select dataType
  partialOptions?: any;
  link?: any; // for link dataType
  useRouter?: boolean; // for link dataType
  hideRowOn?: any | ((data: any) => boolean);
  map?: Function;
  reverseMap?: Function;
}

export interface TableActionConfiguration extends CustomConfigs {
  show?: boolean;
  name?: string;
  class?: string;
  subHeader?: string;
  subHeaderClass?: string;
  types?: any;
  static?: string[];
  clicked?: (actionEvent: ActionEvent) => void;
  actionsOnRow?: (event: {row: any, types: any}) => string[];
}

export interface TableIndexConfiguration extends CustomConfigs {
  show?: boolean; // default: true
  name?: string;
  class?: string;
  subHeader?: string;
  subHeaderClass?: string;
  rowIndexType?: IndexType;
  rowIndexPattern?: IndexPatternFn;
}

export interface TableRowGroupActionsConfiguration extends TableActionConfiguration {
  clicked?: (event: any) => void;
}

export interface TableRowGroupsConfiguration extends CustomConfigs {
  groupBy?: string;
  name?: any;
  indexType?: IndexType;
  indexPattern?: IndexPatternFn;
  orders?: string;
  dataOrders?: [string, 'asc' | 'desc'];
  namespan?: number;
  actions?: TableRowGroupActionsConfiguration[];
}

export interface TableColumnGroupsConfiguration extends CustomConfigs {
  groupName: string;
  props: string[];
  id?: string | number | symbol;
  subGroups?: TableColumnGroupsConfiguration[];
}

export interface TableConfigs extends CustomConfigs {
  columns: TableColumnConfigurations[];
  rowGroups?: TableRowGroupsConfiguration[];
  columnGroups?: TableColumnGroupsConfiguration[];
  index?: TableIndexConfiguration;
  actions?: TableActionConfiguration[];
  formulas?: {
    all?: {
      expression: string
    }[],
  };
  editing?: {
    enabled?: boolean,
    allowAdding?: boolean,
    generateIdentifier?: boolean,
  };
  paging?: {
    enabled?: boolean,
    metadata?: boolean,
    totalRecords?: number,
    pageNumber?: number,
    pageSize?: number,
    onPageChanged?: (page: { pageNumber: number, pageSize: number }) => void;
  };
  rowIdentifier?: string;
}

export interface ActionEvent {
  type: string;
  row: any;
  rowIndex: number;
  tableData: TableData;
  group?: any;
}

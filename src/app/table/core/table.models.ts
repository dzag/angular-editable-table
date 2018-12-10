export type InputType = 'text' | 'textarea' | 'select' | 'date' | 'buttons' | 'link' | 'checkbox' | 'number' | 'currency';

export type TableButton = 'edit' | 'delete' | 'search' | 'download';

export interface SelectOption {
  id?: number;
  value?: string;
}

export interface ColumnDescriptor<T> {
  colName?: string;
  colClass?: string;
  dataClass?: string;
  subHeader?: string;
  subHeaderClass?: string;
  prop?: keyof T;
  type: InputType;
  link?: (row: T) => string;
  editOnClick?: boolean;
  useRouter?: boolean; // default true
  options?: SelectOption[];
  buttons?: TableButton[];
  transformer?: Function;
  reverseTransformer?: Function;
}

export interface ColumnGroup<T> {
  groupName: string;
  props: Array<keyof T>;
  subGroups?: ColumnGroup<T>[];
}

import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, get, isNil, set } from 'lodash';
import { FormControl } from '@angular/forms';
import * as math from 'mathjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Subject, Subscription } from 'rxjs';
import { BaseTableComponent } from '../../core/base-table.component';
import { DateToStringPipe } from '../../core/pipes/date-pipes';
import { PaginationService } from '../../paginator/pagination.service';

type TableEvent = 'edited' | 'editedRow' | 'page' | 'buttonClicked';
interface ActiveRow {
  row: number;
  col: number;
  data: any;
  prop: string;
  path: string;
  formControl?: FormControl;
}

const log = (...message) => console.log('[RowGrouping]', ...message);

@Component({
  selector: 'row-grouping-table',
  templateUrl: './row-grouping-table.component.html',
  styleUrls: ['./row-grouping-table.component.scss']
})
export class RowGroupingTableComponent extends BaseTableComponent implements OnInit, OnDestroy {

  @Input() levels;

  @Input()
  get groupData (): any[] {
    return this._groupData;
  }

  set groupData (value: any[]) {
    this.isGroup = (value || []).length > 0;
    this._groupData = value || [];
    if (this.descriptors) {
      this.groupDataBuilt = this.buildGroupData(cloneDeep(this._groupData));
    }
  }

  @Input() buttonClicked: EventEmitter<{}>;
  @Input() edited: EventEmitter<{}>;
  @Input() editedRow: EventEmitter<{}>;

  private _activeSubscription: Subscription;
  private _path: any;
  private _toRenderRows: any;
  private _toRenderRowIndex: any;
  private _inputChange = new Subject<any>();
  public active?: ActiveRow;
  private _datePipe = new DateToStringPipe();
  private _activeFormControl: FormControl;
  private _groupData = [];
  public rows = [];
  groupDataBuilt;
  isGroup = false;

  constructor (paginationService: PaginationService,
               changeDetectorRef: ChangeDetectorRef,
  ) {
    super(paginationService, changeDetectorRef);
  }

  ngOnInit () {
    super.ngOnInit();

    this.subHeaders = this.buildSubHeaders();

    if (this._groupData) {
      this.groupDataBuilt = this.buildGroupData(this._groupData);
    }

    for (const descriptor of this.descriptors) {
      if (['select', 'autocomplete'].includes(descriptor.type)) {
        descriptor['$$options'] = descriptor.options.reduce((prev, current) => {
          prev[current.id] = current.value;
          return prev;
        }, {});
      }
    }

    const indexDesMap = this.descriptors.reduce((prev, current, index) => {
      prev[`${current.prop}`] = index;
      return prev;
    }, {});

    const findExpression = (prop): [string, string] => {
      return Object.entries(this.expressions).find(([key, value]: [string, string]) => {
        return value.includes(prop);
      }) as [string, string];
    };

    this._inputChange.pipe(untilDestroyed(this))
      .subscribe((current) => {
        const expression = findExpression(current.prop);
        if (expression) {
          let {value, col} = current;
          const descriptor = this.descriptors[col];
          const reverseFn = descriptor.reverseTransformer || ((i) => i);
          const prop = descriptor.prop;

          const finalValue = reverseFn(value.value);
          const dataPath = this.getGroupPath(current.group.path);
          const groupData = get(this.groupData, dataPath)[current.row];

          set(groupData, prop, finalValue);

          let [result, formula] = expression;
          Object.entries(groupData).forEach(([key, value]: [string, string]) => {
            formula = formula.replace(key, `${value || 0}`);
          });
          const resultIndex = indexDesMap[result];
          const calculated = math.eval(formula);
          set(groupData, result, calculated);

          const dataBuilt = get(this.groupDataBuilt, dataPath)[current.row];
          set(dataBuilt, `[${resultIndex}]`, { value: calculated });
        }

        this.emit(['edited', 'editedRow'], current);
        this._path = current.group.path;
        this._toRenderRowIndex = current.row;
        this._toRenderRows = this.newRow(current.value, current.row, current.col, current.group.path);
      });
  }

  ngOnDestroy (): void {
    super.ngOnDestroy();
  }

  click (rowIndex, colIndex, data, group, prop) {
    if (!this.canEdit) {
      return;
    }

    const descriptor = this.descriptors[colIndex];
    this.renderItemOnGrid();

    if (this.active && this.active.row === rowIndex && this.active.col === colIndex && this.active.path !== group.path) {
      return;
    }

    if (this._activeSubscription) {
      this._activeSubscription.unsubscribe();
    }

    this.active = {
      row: rowIndex,
      col: colIndex,
      prop: prop,
      path: group.path,
      data
    };

    if (descriptor.editOnClick) {
      const formControl = this._activeFormControl = new FormControl();

      const groupPath = this.getGroupPath(group.path);
      this._activeSubscription = formControl.valueChanges.subscribe(value => {
        this._inputChange.next({
          value: {...data, value},
          group: group,
          prop: prop,
          old: data,
          row: rowIndex,
          col: colIndex,
        });
      });
      formControl.setValue(data.value, { emitEvent: false });
      this.active.formControl = formControl;
    }
  }

  onButtonClickedGroup (type, row, group) {
    const groupData: any = cloneDeep(this._groupData);
    const path = this.getPath(group.path, row);
    this.buttonClicked.emit({
      button: type,
      rowIndex: row,
      rowData: get(groupData, path),
      currentData: groupData
    });
  }

  isEditing (active, row, col, path) {
    return active && active.row === row && active.col === col && active.path === path;
  }

  getValue (col, item) {
    const data = item.value;
    const descriptor = this.descriptors[col];
    const type = descriptor.type;
    switch (type) {
      case 'select':
        return descriptor['$$options'][data] || '';
      case 'date':
        return this._datePipe.transform(data);
      case 'text':
      default:
        return data;
    }
  }

  protected newRow (value: any, rowIndex: number, colIndex: number, path: string) {
    path = this.getPath(path, rowIndex);
    const rowData = [...get(this.groupDataBuilt, path)];
    rowData[colIndex] = value;
    return rowData;
  }

  protected emit (event: TableEvent | TableEvent[], data) {
    const events = Array.isArray(event) ? event : [event];

    const dataToEmit: any = {};
    if (events.includes('edited') || events.includes('editedRow')) {
      let {value, row, col, group} = data;
      const descriptor = this.descriptors[col];
      const reverseFn = descriptor.reverseTransformer || ((i) => i);
      const prop = descriptor.prop;

      const finalValue = reverseFn(value.value);
      const path = this.getPath(group.path, row);

      set(this.groupData, `${path}[${prop}]`, finalValue);

      if (events.includes('edited')) {
        dataToEmit.edited = cloneDeep(this.groupData);
      }
    }

    events.forEach(evt => this[evt].emit(dataToEmit[evt]));
  }

  protected renderItemOnGrid () {
    if (!isNil(this._toRenderRows) && !isNil(this._toRenderRowIndex) && !isNil(this._path)) {
      const data = get(this.groupDataBuilt, this._path).data;
      data[this._toRenderRowIndex] = this._toRenderRows;
    }

    this._path = undefined;
    this._toRenderRowIndex = undefined;
    this._toRenderRows = undefined;
  }

  private buildGroupData (groupData) {
    let _deepLevel = 0;
    const _groupBuild = [...groupData];
    const indexes = [];
    const buildGroupData = (groupBuild): any => {
      _deepLevel++;
      const clone = [...groupBuild];

      clone.forEach((data, index) => {
        indexes.push(index);
        data.level = _deepLevel;
        data.path = indexes.join('.');
        if (data.data) {
          data.data = this.buildRows(data.data);
        }
        if (data.subGroups) {
          buildGroupData(data.subGroups);
        }
        indexes.pop();
      });
      _deepLevel--;
    };

    buildGroupData(_groupBuild);
    return _groupBuild;
  }

  private getPath(path, row) {
    return path.split('.').map(index => `[${index}]`).join('.subGroups') + `.data[${row}]`;
  }

  private getGroupPath(path) {
    return path.split('.').map(index => `[${index}]`).join('.subGroups') + `.data`;
  }

}

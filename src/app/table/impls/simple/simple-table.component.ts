import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, isNil, set } from 'lodash';
import { FormControl } from '@angular/forms';
import * as math from 'mathjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Subject, Subscription } from 'rxjs';
import { BaseTableComponent } from '../../core/base-table.component';
import { CellService } from '../../core/table-cell/cell.service';
import { CellManager } from '../../core/table-cell/cell-manager.service';
import { TableDataService } from '../../core/data/table-data.service';
import { TableData } from '../../core/data/table-data';
import { FormulaParser } from '../../core/formula/formula-parser';
import { PaginationService } from '../../paginator/pagination.service';
import { DateToStringPipe } from '../../core/pipes/date-pipes';

interface ActiveRow {
  row: number;
  col: number;
  data: any;
  formControl?: FormControl;
}

type TableEvent = 'edited' | 'editedRow' | 'page' | 'buttonClicked';

@Component({
  selector: 'simple-table',
  templateUrl: './simple-table.component.html',
  styleUrls: ['./simple-table.component.scss'],
  providers: [
    CellService,
    CellManager,
    {
      provide: TableDataService,
      useClass: TableDataService,
      deps: [CellManager, ChangeDetectorRef]
    }
  ]
})
export class SimpleTableComponent extends BaseTableComponent implements OnInit, OnDestroy {

  @Input()
  get data (): Object[] {
    return this._data;
  }

  set data (value: Object[]) {
    this._data = cloneDeep(value) || [];
    this.rows = this.buildRows(this._data);
  }

  @Input() buttonClicked: EventEmitter<{}>;
  @Input() edited: EventEmitter<{}>;
  @Input() editedRow: EventEmitter<{}>;

  @Input() activeCell: EventEmitter<{} | any>;

  @Input() canAddRow;

  @Input() formulas;

  public readonly words = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  public rows = [];
  public active?: ActiveRow;

  public tableData: TableData;

  private _data: Object[];

  private _activeFormControl: FormControl;
  private _activeSubscription: Subscription;
  private _inputChange = new Subject<any>();

  private _toRenderRowIndex: any;
  private _toRenderRows: any;

  private _datePipe = new DateToStringPipe();

  constructor (paginationService: PaginationService,
               changeDetectorRef: ChangeDetectorRef,
               public cellService: CellService,
               private dataService: TableDataService,
               private cellManager: CellManager,
  ) {
    super(paginationService, changeDetectorRef);
  }

  onCellClick(cell) {
    this.cellService.setActive(cell);
  }

  ngOnInit () {
    super.ngOnInit();

    this.tableData = new TableData(this.descriptors, this.data);
    this.dataService.tableData  = this.tableData;
    this.dataService.formulaParser = new FormulaParser(this.descriptors, this.formulas);

    this.cellManager.getCellsInArea('B.1', 'D.1').subscribe(cells => {
      console.log(cells);
    });


    // OLD STUFF, MIGHT NEED SOMETHING HERE
    this.rows = this.buildRows(this.data);
    this.headers = this.buildHeaders();
    this.subHeaders = this.buildSubHeaders();

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
        let {value, row, col} = current;
        const descriptor = this.descriptors[col];
        const prop = descriptor.prop;
        const expression = findExpression(prop);
        if (expression) {
          const reverseFn = descriptor.reverseTransformer || ((i) => i);

          const finalValue = reverseFn(value.value);
          const rowData = this.data[row];

          set(rowData, prop, finalValue);

          let [result, formula] = expression;
          Object.entries(rowData).forEach(([key, value]: [string, string]) => {
            formula = formula.replace(key, `${value || 0}`);
          });
          const resultIndex = indexDesMap[result];
          const calculated = math.eval(formula);
          set(rowData, result, calculated);

          set(this.rows, `[${row}][${resultIndex}]`, { value: calculated });
        }

        this.emit(['edited', 'editedRow'], current);
        this._toRenderRowIndex = current.row;
        this._toRenderRows = this.newRow(current.value, current.row, current.col);
      });
  }

  ngOnDestroy (): void {
    super.ngOnDestroy();
  }

  @HostListener('click', ['$event'])
  onClicked(event) {
    event.target.focus();
    this.renderItemOnGrid();
    this.active = null;
  }

  click (rowIndex, colIndex, data) {
    if (!this.canEdit) {
      return;
    }

    const descriptor = this.descriptors[colIndex];
    this.renderItemOnGrid();

    if (this.active && this.active.row === rowIndex && this.active.col === colIndex) {
      return;
    }

    if (this._activeSubscription) {
      this._activeSubscription.unsubscribe();
    }

    this.active = {
      row: rowIndex,
      col: colIndex,
      data
    };

    if (descriptor.editOnClick) {
      const formControl = this._activeFormControl = new FormControl();
      this._activeSubscription = formControl.valueChanges.subscribe(value => {
        this._inputChange.next({
          value: {...data, value},
          old: data,
          row: rowIndex,
          col: colIndex,
        });
      });
      formControl.setValue(data.value, { emitEvent: false });
      this.active.formControl = formControl;

      if (this.activeCell.observers.length > 0) {
        const dataSnapshot = cloneDeep(this._data);
        this.activeCell.next({
          formControl,
          snapshot: {
            row: dataSnapshot[rowIndex],
            table: dataSnapshot,
            cell: cloneDeep(data.value),
            rowIndex,
            colIndex,
          }
        });
      }
    }
  }

  onButtonClicked (type, row) {
    const data = cloneDeep(this._data);
    this.buttonClicked.emit({
      button: type,
      rowIndex: row,
      rowData: data[row],
      currentData: data,
    });
  }

  isEditing (active, row, col) {
    return active && active.row === row && active.col === col;
  }

  getValue (col, item) {
    const data = item.value;
    const descriptor = this.descriptors[col];
    const type = descriptor.type;
    switch (type) {
      case 'select':
        return descriptor['$$options'][data] || '';
      case 'date':
        if (data instanceof Date) {
          return this._datePipe.transform(data);
        }
        return data;
      case 'text':
      default:
        return data;
    }
  }

  addRow () {
    const { row, object } = this.createNewRow();
    this.rows = this.rows.concat([row]);
    this._data.push(object);

    this.edited.next(cloneDeep(this._data));
  }

  createNewRow () {
    const lastRow = this.data[this.data.length - 1];

    const result = [];
    const object = lastRow ? cloneDeep(lastRow) : {};
    object['$$generated'] = true;
    this.descriptors.forEach(descriptor => {
      const prop = descriptor.prop as string;
      result.push({ value: '' });
      object[prop] = '';
    });
    return {
      row: result,
      object,
    };
  }

  protected emit (event: TableEvent | TableEvent[], data) {
    const events = Array.isArray(event) ? event : [event];

    const dataToEmit: any = {};
    if (events.includes('edited') || events.includes('editedRow')) {
      let {value, row, col} = data;
      const descriptor = this.descriptors[col];
      const reverseFn = descriptor.reverseTransformer || ((i) => i);
      const prop = descriptor.prop;
      const finalValue = reverseFn(value.value);
      set(this._data, `[${row}].${prop}`, finalValue);

      if (events.includes('edited')) {
        dataToEmit.edited = cloneDeep(this._data);
      }

      if (events.includes('editedRow')) {
        dataToEmit.editedRow = cloneDeep(this._data[row]);
      }
    }

    events.forEach(evt => this[evt].emit(dataToEmit[evt]));
  }

  protected renderItemOnGrid () {
    if (!isNil(this._toRenderRows) && !isNil(this._toRenderRowIndex)) {
      this.rows[this._toRenderRowIndex] = [...this._toRenderRows];
    }

    this._toRenderRowIndex = undefined;
    this._toRenderRows = undefined;
  }

  protected newRow (value: any, rowIndex: number, colIndex: number) {
    const rowData = [...this.rows[rowIndex]];
    rowData[colIndex] = value;
    return rowData;
  }

}

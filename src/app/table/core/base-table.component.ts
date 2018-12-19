import { ChangeDetectorRef, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { ColumnDescriptor, ColumnGroup } from './table.models';
import { tableActions } from './table-actions';
import { map, skip } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { PaginationService } from '../paginator/pagination.service';

export class BaseTableComponent implements OnInit, OnDestroy {

  @Input() class = 'table-responsive';

  @Input() withIndex = true;
  @Input() indexName = 'STT';
  @Input() indexClass = 'text-center fix-w-40';
  @Input() indexSubHeader = '';
  @Input() indexSubHeaderClass = '';
  @Input() identifier = 'id';
  @Input() inlineSave = false;

  @Input() subHeader = false;
  @Input() subHeaderClass = 'text-center font-italic';
  @Input() metadata = false;
  @Input() paging = false;
  @Input() externalPaging = false;

  @Input() currentPage = 1;
  @Input() totalPages = 10;
  @Input() recordsPerPage = 10;

  @Input() canEdit;
  @Input() expressions;

  @Input() page: EventEmitter<{}>;

  @Input()
  set totalRecords (value: number) {
    if (!this.paging) {
      return;
    }
    this.paginationService.setTotalItems(value);
  }

  @Input()
  get descriptors (): ColumnDescriptor<Object>[] {
    return this._descriptors;
  }

  set descriptors (value: ColumnDescriptor<Object>[]) {
    if (this._optionsChangedFn) {
      this.descriptors['$$unsubscribe'] = this._optionsChangedFn;
      this._optionsChangedFn = undefined;
    }
    this._descriptors = value;
    if (!this._optionsChangedFn) {
      this._optionsChangedFn = ({ target, prop }) => {
        for (const descriptor of this.descriptors) {
          if (['select', 'autocomplete'].includes(descriptor.type)) {
            descriptor['$$options'] = descriptor.options.reduce((prev, current) => {
              prev[current.id] = current.value;
              return prev;
            }, {});
          }
        }
        this.cd.markForCheck();
      };
      value['$$subscribe'] = this._optionsChangedFn;
    }
  }

  @Input()
  get colGroups (): ColumnGroup<Object>[] {
    return this._colGroups;
  }

  set colGroups (value: ColumnGroup<Object>[]) {
    this._colGroups = value || [];
  }

  subHeaders: string[] = [];

  buttons = tableActions;

  currentOffset$: Observable<number>;

  private _colGroups?: ColumnGroup<Object>[] = [];

  private _optionsChangedFn: (params: { target: any, prop: string }) => any;
  private _descriptors: ColumnDescriptor<Object>[];

  constructor (protected paginationService: PaginationService,
               protected cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.validate();
    this.doPaging();
  }

  ngOnDestroy (): void {
    this.descriptors['$$unsubscribe'] = this._optionsChangedFn;
  }

  trackByIndex (index) {
    return index;
  }

  protected buildSubHeaders () {
    return this.descriptors.map(descriptor => descriptor.subHeader || '');
  }

  /**
   * This will build a matrix (2D array) by data and descriptors inputs
   * The matrix will be like
   * ```
   * [[ {}, {}, {} ],
   *  [ {}, {}, {} ]]
   * ```
   */
  protected buildRows<T> (data: Object[] | null | undefined) {
    if (!data) {
      return;
    }

    return data.map(item => {
      const row = [];
      this.descriptors.forEach(({prop, link, transformer}) => {
        const result: any = {};
        result.value = transformer
          ? transformer(item[prop])
          : item[prop];

        if (link) {
          result.url = link(item);
        }
        row.push(result);
      });
      return row;
    });
  }

  protected doPaging () {
    if (!this.paging) {
      return;
    }

    this.paginationService.set({
      pageSize: this.recordsPerPage,
      pageNumber: this.currentPage,
    });

    this.paginationService.getPage()
      .pipe(skip(1), untilDestroyed(this))
      .subscribe(this.page);

    this.currentOffset$ = this.paginationService.getPage().pipe(
      map(page => (page.pageNumber - 1) * page.pageSize)
    );
  }

  protected validate () {
    // if (!(this.identifier && this._data && this.descriptors)) {
    //   throw new Error(`TableComponent needs all three inputs.`);
    // }
  }
}

import { get, last } from 'lodash';
import { ChangeDetectorRef, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { ColumnDescriptor, ColumnGroup } from './table.models';
import { tableButtons } from './table-buttons';
import { buildPropToPathMap, emptyArrays, getPath, insertAt, pushEmptyArrays, totalSubGroupProps, depth as getDepth } from './table.utils';
import { map, skip } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { PaginationService } from '../paginator/pagination.service';

type RowSpan = number;
type ColSpan = number;
type GroupName = string;
type GroupClass = string;
type HeaderTuple = [GroupName, GroupClass, RowSpan, ColSpan];
type Group = {
  name: string,
  class: string,
};

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
    this.headers = this.buildHeaders();
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

    if (!this._colGroupsChangedFn && !!value) {
      this._colGroupsChangedFn = ({ target, prop }) => {
        if (prop === 'groupName') {
          this.headers = this.buildHeaders();
        }
      };
      value['$$subscribe'] = this._colGroupsChangedFn;
    }

    this.headers = this.buildHeaders();
  }

  headers: HeaderTuple[] = [];
  subHeaders: string[] = [];

  buttons = tableButtons;

  currentOffset$: Observable<number>;

  private _colGroups?: ColumnGroup<Object>[] = [];
  private _colGroupsChangedFn: (params: { target: any, prop: string }) => any;

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

  /**
   * This also build another matrix for the table header
   */
  protected buildHeaders () {
    const isValidColGroupsInput = this._colGroups.length !== 0;
    if (!isValidColGroupsInput) {
      const headers: HeaderTuple[] = this.descriptors
        .map(descriptor => ([descriptor.colName, descriptor.colClass, 1, 1])) as HeaderTuple[];

      if (this.withIndex) {
        headers.unshift([this.indexName, this.indexClass, 1, 1]);
      }

      return [headers];
    }

    const propToGroupIndexMap: any = buildPropToPathMap(this._colGroups);

    /*
      groupNames should have a structure like this
      [
         [ {name, class},
           {name, class},
           [{ name, class}, {name, class}, '0.0']
           0],
         {name, class},
         {name, class},
      ]
     */
    const groups: any[] = [];
    const mainGroupArrayCache = {};
    const simpleCache = {};

    for (const descriptor of this.descriptors) {
      const hasDescriptorsProp = propToGroupIndexMap.hasOwnProperty(descriptor.prop);
      const objectToAdd = {name: descriptor.colName || '', class: descriptor.colClass};
      if (hasDescriptorsProp) {
        const simplePath = propToGroupIndexMap[descriptor.prop];
        const isSubgroup = simplePath.indexOf('.') >= 0;

        const path: string = getPath(propToGroupIndexMap[descriptor.prop]);

        const cache = mainGroupArrayCache;
        let cachedArray = cache[path];
        if (!cachedArray) {
          cachedArray = [];
          cachedArray.push(path);
          cachedArray.unshift(objectToAdd);
          cache[path] = cachedArray;
          simpleCache[simplePath] = cachedArray;

          if (!isSubgroup) {
            groups.push(cachedArray);
          } else {
            const parentProp = simplePath.substr(0, simplePath.lastIndexOf('.'));
            const arr = get(simpleCache, parentProp) as any[];

            if (arr) { // fix an edge case where there is no parent props
              insertAt(arr, arr.length - 1, cachedArray);
            } else {
              const realPath = getPath(parentProp);
              const newArray = [];
              newArray.push(realPath);
              insertAt(newArray, newArray.length - 1, cachedArray);
              cache[realPath] = newArray;
              simpleCache[parentProp] = newArray;
              groups.push(newArray);
            }
          }

        } else {
          insertAt(cachedArray, cachedArray.length - 1, objectToAdd);
        }
      } else {
        groups.push(objectToAdd);
      }
    }

    // makes groups be a candidate for recursive call
    groups.push('$$root');

    const depth = getDepth(groups);

    // [ [Dates, 1, 6]   , []                  , []                   , []                    , []               , []               , [Something, 1, 2], []              ,
    //   [Noi Dung, 3, 1], [Ngay bat dau, 3, 1], [Dates 2, 1, 2]      , []                    , [Dates 3, 1, 2]  , []               , [Tong tien, 3, 1], [Dung sai, 3, 1],
    //   []             , []                  , [Ngay ket thuc, 2, 1], [Dates sub, 1, 1]     , [Tinh hinh, 2, 1], [Trang thai, 2, 1], []               , [],
    //   []             , []                  , []                   , [Kien toan viem, 1, 1], []               , []                , [],              , [],             ]
    const groupTuple = emptyArrays(depth);
    let deepLevel = -1;
    const traverseGroups = (_groups: any[]) => {
      deepLevel++;
      const groupPath = last(_groups);
      // log('traverse', 'groupName', deepLevel, (get(this.colGroups, groupPath) || {} as any).groupName || '');

      const theGroup = get(this._colGroups, groupPath);
      if (theGroup) {
        const propsLength = theGroup.subGroups
          ? totalSubGroupProps(theGroup.subGroups) + theGroup.props.length
          : theGroup.props.length;
        groupTuple[deepLevel - 1].push([theGroup.groupName, '', 1, propsLength]);
        pushEmptyArrays(groupTuple[deepLevel - 1], propsLength - 1);
      }
      _groups.forEach((group) => {
        const isObject = !Array.isArray(group);
        if (isObject) {
          if (typeof group !== 'string') {
            groupTuple[deepLevel].push([group.name, group.class, depth - deepLevel, 1]);
            for (let i = 1; i < depth - deepLevel; i++) {
              groupTuple[deepLevel + i].push([]);
            }
          }
        } else {
          traverseGroups(group);
        }
      });
      deepLevel--;
    };

    traverseGroups(groups);

    if (this.withIndex) {
      groupTuple.forEach((group, index) => {
        const toPrepend = index === 0
          ? [this.indexName, this.indexClass, depth, 1]
          : [];
        group.unshift(toPrepend);
      });
    }

    return groupTuple;
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

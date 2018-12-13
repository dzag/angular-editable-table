import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { PaginationService } from './paginator/pagination.service';

const log = (...message: any[]) => console.log('[TableComponent]', ...message);

@Component({
  selector: 'ga-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [
    PaginationService,
  ]
})
export class TableComponent implements OnInit, OnDestroy {

  @HostBinding('class') hostClass = 'xt-table';

  // Simple table only
  @Input() data;

  // Row grouping table only
  @Input() groupData;
  @Input() levels;

  // Shared inputs
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
  @Input() totalRecords = 10;

  @Input() descriptors;
  @Input() colGroups;

  @Input() canAddRow = false;
  @Input() canEdit = true;

  @Input() formulas: any = [];
  @Input() expressions: any = {};

  @Output() buttonClicked = new EventEmitter();
  @Output() edited = new EventEmitter();
  @Output() editedRow = new EventEmitter();

  @Output() activeCell = new EventEmitter();

  @Output() page = new EventEmitter();

  constructor () {}

  ngOnInit () {}

  ngOnDestroy (): void {}

}

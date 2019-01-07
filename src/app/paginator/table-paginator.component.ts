import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { range } from 'lodash';
import { PaginationService } from './pagination.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';

@Component({
  selector: 'table-pagination',
  templateUrl: './table-paginator.component.html',
  styleUrls: ['./table-paginator.component.scss']
})
export class TablePaginatorComponent implements OnInit, OnDestroy {

  @Input() alignItem = 'align-right';

  @Input() set pageNumber (value: number) {
    this.pagination.set({ pageNumber: value, $$fromUser: true });
  }

  @Output() page = new EventEmitter();

  pageControl = new FormControl();
  totalPages$: Observable<number>;
  listPage$: Observable<number[]>;

  constructor (public pagination: PaginationService
  ) {}

  ngOnInit () {
    this.totalPages$ = this.pagination.getMetadata().pipe(pluck('$$totalPages'));
    this.listPage$ = this.totalPages$.pipe(map(total => range(1, total + 1)));

    this.pagination.getPage(true).pipe(untilDestroyed(this)).subscribe(page => {
      this.pageControl.setValue(page.pageNumber, { emitEvent: false });
    });

    this.pagination.getPage()
      .pipe(untilDestroyed(this))
      .subscribe(this.page);

    this.pageControl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(page => {
        this.pagination.set({ pageNumber: parseInt(page, 10) });
      });
  }

  get canNext () {
    return this.pagination.getMetadata().pipe(map(res => !res.$$next));
  }

  get canPrev () {
    return this.pagination.getMetadata().pipe(map(res => !res.$$prev));
  }

  ngOnDestroy (): void {
  }

}

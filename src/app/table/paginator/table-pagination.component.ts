import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { range } from 'lodash';
import { PaginationService } from './pagination.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Observable } from 'rxjs';
import { map, pluck, skip } from 'rxjs/operators';

@Component({
  selector: 'table-pagination',
  templateUrl: './table-pagination.component.html',
  styleUrls: ['./table-pagination.component.scss']
})
export class TablePaginationComponent implements OnInit, OnDestroy {

  @Input() alignItem = 'align-right';

  @Input() set pageNumber(value: number) {
    this.pagination.set({ pageNumber: value });
  }

  @Output() page = new EventEmitter();

  pageControl = new FormControl();
  totalPages$: Observable<number>;
  listPage$: Observable<number[]>;

  constructor (public pagination: PaginationService
  ) {}

  ngOnInit () {
    this.pagination.select('pageNumber')
      .pipe(
        untilDestroyed(this),
      ).subscribe(page => {
      this.pageControl.setValue(page, { emitEvent: false });
    });

    this.totalPages$ = this.pagination.getMetadata().pipe(pluck('$$totalPages'));
    this.listPage$ = this.totalPages$.pipe(map(total => range(1, total + 1)));

    this.pagination.getPage()
      .pipe(skip(1), untilDestroyed(this))
      .subscribe(this.page);

    this.pageControl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(page => {
        this.pagination.set({ pageNumber: parseInt(page, 10) });
      });
  }

  get canNext() {
    return this.pagination.getMetadata().pipe(map(res => !res.$$next));
  }

  get canPrev() {
    return this.pagination.getMetadata().pipe(map(res => !res.$$prev));
  }

  ngOnDestroy (): void {
  }

}

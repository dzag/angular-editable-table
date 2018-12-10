import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PaginationService } from './pagination.service';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'table-metadata',
  templateUrl: './table-metadata.component.html',
  styleUrls: ['./table-metadata.component.scss']
})
export class TableMetadataComponent implements OnInit, OnDestroy {
  @Input() alignItem: string;
  @Input() set totalItems (value: number) {
    this.pagination.setTotalItems(value);
  }

  linesPerPage = [10, 20, 30, 40];
  total$: Observable<number>;
  selectControl = new FormControl(10);

  constructor (private pagination: PaginationService) { }

  ngOnInit () {
    this.total$ = this.pagination.getTotalItems() as Observable<number>;

    this.pagination.select('pageSize')
      .pipe(untilDestroyed(this))
      .subscribe(pageSize => {
        this.selectControl.setValue(pageSize, { emitEvent: false, onlySelf: true });
      });

    this.selectControl.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      this.pagination.set({ pageSize: parseInt(value, 10), pageNumber: 1 });
    });

  }

  ngOnDestroy (): void {
  }

}

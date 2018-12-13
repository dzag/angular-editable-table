import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TableConfigurations } from './core/table-configurations';


@Component({
  selector: 'ng-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy {

  @Input() configurations: TableConfigurations;

  constructor (private detectorRef: ChangeDetectorRef) {}

  ngOnInit () {
    this.patchConfigs();
  }

  ngOnDestroy (): void {}

  private patchConfigs() {
    const configs: any = this.configurations;
    configs._cd = this.detectorRef;
  }

}

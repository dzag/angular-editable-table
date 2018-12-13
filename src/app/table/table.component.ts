import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TableConfigurations } from './core/table-configurations';
import { TableData } from './core/data/table-data';
import { TableDataService } from './core/data/table-data.service';
import { CellManager } from './core/table-cell/cell-manager.service';
import { CellService } from './core/table-cell/cell.service';


@Component({
  selector: 'ng-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
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
export class TableComponent implements OnInit, OnDestroy {

  @Input() configurations: TableConfigurations;
  @Input() data: any[];

  public readonly words = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  public tableData: TableData;

  constructor (private detectorRef: ChangeDetectorRef,
               private dataService: TableDataService,
               private cellManager: CellManager,
  ) {}

  ngOnInit () {
    this.patchConfigs();

    this.tableData = new TableData(this.configurations.states.columns, this.data);
    this.dataService.tableData = this.tableData;
  }

  ngOnDestroy (): void {}

  private patchConfigs() {
    const configs: any = this.configurations;
    configs._cd = this.detectorRef;
  }

}

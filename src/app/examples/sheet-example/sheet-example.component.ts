import { Component, OnInit } from '@angular/core';
import { random } from 'lodash';
import { ActionEvent, TableData } from '../../table';
import { TableConfigurations } from '../../table/core/table-configurations';

const nameMapper = {
  1: 'Tỉnh 1',
  2: 'Tỉnh 2',
  3: 'Tỉnh 3',
  4: 'Tỉnh 4',
  5: 'Tỉnh 5',
};

const name2Mapper = {
  1: 'Huyện 1',
  2: 'Huyện 2',
  3: 'Huyện 3',
};

const name3Mapper = {
  1: 'Xã 1',
  2: 'Xã 2',
  3: 'Xã 3',
};

@Component({
  selector: 'app-sheet-example',
  templateUrl: './sheet-example.component.html',
  styleUrls: ['./sheet-example.component.scss']
})
export class SheetExampleComponent implements OnInit {

  data = new TableData();

  formulas = {
    all: [
      'total = col1 + col2',
    ],
    static: [
      '{B.0} = sum({B.1:D.3}) + {C.1} + {D.2}'
    ]
  };

  configs = new TableConfigurations({
    columns: [
      {
        prop: 'total',
        name: 'Total',
        dataType: 'currency',
        headerClass: 'hello2',
        dataClass: 'hello',
        subHeader: '(1)',
        subHeaderClass: 'subHeaderClass',
      },
      {
        prop: 'col1',
        name: 'Col 1',
        editable: true,
        dataType: 'currency'
      },
      {
        prop: 'col2',
        name: 'Col 2',
        editable: true,
        dataType: 'currency'
      },
      {
        prop: 'col3',
        name: 'Col 3',
        dataType: 'select',
        editable: true,
        options: [
          {id: 1, value: 'hello 1'},
          {id: 2, value: 'hello 2'},
          {id: 3, value: 'hello 3'},
          {id: 4, value: 'hello 4'},
        ],
        partialOptions(row) {
          if (row.belongsTo < 3) {
            return [1, 2];
          }

          return [3, 4];
        }
      },
      {
        prop: 'col4',
        name: 'Col 4',
        dataType: 'link',
        link: (row) => {
          return 'test' + row.belongsTo;
        },
        useRouter: true,
      },
      {
        prop: 'col5',
        name: 'Col 5',
        dataType: 'currency'
      },
      {
        prop: 'col6',
        name: 'Col 6',
        dataType: 'currency'
      },
      {
        prop: 'col7',
        name: 'Col 7',
        dataType: 'currency'
      },
      {
        prop: 'col8',
        name: 'Col 8',
        dataType: 'date'
      },
    ],
    rowGroups: [
      {
        groupBy: 'belongsTo',
        name: (firstRowData) => firstRowData.name, // Optional
        indexType: 'romanNumeral',
      },
      {
        groupBy: 'sameId',
        name: (firstRowData) => firstRowData.name2, // Optional
        // indexPattern: (currentIndex, {parentIndex, parentText}) => {}, // Optional,
      },
      {
        groupBy: 'sameId2',
        name: (firstRowData) => firstRowData.name3, // Optional
        indexPattern: (currentIndex, {parentIndex, parentText}) => {
          return parentText + `.${currentIndex + 1}`;
        }
      }
    ],
    columnGroups: [
      {
        groupName: 'Hello world',
        groupClass: 'first-class',
        props: ['col1', 'col2'],
        subGroups: [
          {
            groupName: 'Subgroup 1',
            props: ['col3', 'col4'],
          },
          {
            groupName: 'Subgroup 2',
            props: ['col5', 'col6'],
          }
        ]
      }
    ],
    index: {
      show: true,
      subHeader: 'indexSubheader',
      subHeaderClass: 'indexSubheaderClass',
      // rowIndexPattern: (currentIndex, {parentIndex, parentText}) => {
      //   return parentText + `.${currentIndex + 1}`;
      // },
    },
    actions: [
      {
        show: true,
        name: 'Actions',
        types: {
          edit: {
            icon: '',
            name: 'Edit',
          },
          download: {
            icon: '',
            name: 'Download',
          }
        },
        static: ['edit', 'download'],
        // actionsOnRow({row, types}) {
        //   if (row.sameId > 1) {
        //     return ['edit', 'download'];
        //   }
        //
        //   return ['download'];
        // },
        clicked: this.onTableButtonsClicked.bind(this)
      },
    ],
  });

  constructor () { }

  ngOnInit () {
    this.configs.hideActionType('edit');
    setTimeout(() => {
      this.data = new TableData(Array(100).fill(null).map((value, index) => (() => {
        const id = random(1, 5);
        const subId = random(1, 3);
        const subId2 = random(1, 3);

        const randomDate = () => new Date(random(2000, 2018), random(0, 11), random(1, 29));

        return {
          total: 0,
          belongsTo: id,
          name: nameMapper[id],
          sameId: subId,
          name2: name2Mapper[subId],
          sameId2: subId2,
          name3: name3Mapper[subId2],
          col1: random(100000000, 1000000000),
          col2: random(100000000, 1000000000),
          col3: id < 3 ? random(1, 2) : random(3, 4),
          col4: random(100000000, 1000000000),
          col5: random(100000000, 1000000000),
          col6: random(100000000, 1000000000),
          col7: random(100000000, 1000000000),
          col8: randomDate()
        };
      })()));
    }, 0);

    setTimeout(() => {
      this.configs.renameGroup('[0].groupName', 'What this <span style="color: red">123</span>?');
    }, 2000);

    setTimeout(() => {
      this.configs.showActionType('edit');
      this.configs.renameColumn(0, 'What this <span style="color: red">123</span>?');
    }, 3000);
  }

  onTableButtonsClicked({type, row, rowIndex, group, tableData}: ActionEvent) {
    tableData.delete(rowIndex, group);
  }

}

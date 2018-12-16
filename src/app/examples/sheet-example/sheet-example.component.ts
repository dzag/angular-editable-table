import { Component, OnInit } from '@angular/core';
import { random } from 'lodash';
import { ColumnDescriptor } from '../../table';
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

  data = Array(20).fill(null).map((value, index) => (() => {
    // if (index === 0) {
    //   return {
    //     total: 0,
    //     col1: 0,
    //     col2: 0,
    //     col3: 0,
    //     col4: 0,
    //     col5: 0,
    //     col6: 0,
    //     col7: 0,
    //     col8: 0,
    //     col9: 0,
    //   };
    // }

    const id = random(1, 5);
    const subId = random(1, 3);
    const subId2 = random(1, 3);

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
      col3: random(100000000, 1000000000),
      col4: random(100000000, 1000000000),
      col5: random(100000000, 1000000000),
      col6: random(100000000, 1000000000),
      col7: random(100000000, 1000000000),
      col8: random(100000000, 1000000000),
      col9: random(100000000, 1000000000),
    };
  })());

  descriptors: ColumnDescriptor<any>[] = [
    {
      prop: 'total',
      colName: 'Total',
      type: 'currency',
      subHeader: '(1)',

    },
    {
      prop: 'col1',
      colName: 'Col 1',
      type: 'currency'
    },
    {
      prop: 'col2',
      colName: 'Col 2',
      type: 'currency'
    },
    {
      prop: 'col3',
      colName: 'Col 3',
      type: 'currency'
    },
    {
      prop: 'col4',
      colName: 'Col 4',
      type: 'currency'
    },
    {
      prop: 'col5',
      colName: 'Col 5',
      type: 'currency'
    },
    {
      prop: 'col6',
      colName: 'Col 6',
      type: 'currency'
    },
    {
      prop: 'col7',
      colName: 'Col 7',
      type: 'currency'
    },
    {
      prop: 'col8',
      colName: 'Col 8',
      type: 'currency'
    },
    {
      prop: 'col9',
      colName: 'Col 9',
      type: 'currency'
    },
  ];

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
        colName: 'Total',
        type: 'currency',
        subHeader: '(1)',
      },
      {
        prop: 'col1',
        colName: 'Col 1',
        type: 'currency'
      },
      {
        prop: 'col2',
        colName: 'Col 2',
        type: 'currency'
      },
      {
        prop: 'col3',
        colName: 'Col 3',
        type: 'currency'
      },
      {
        prop: 'col4',
        colName: 'Col 4',
        type: 'currency'
      },
      {
        prop: 'col5',
        colName: 'Col 5',
        type: 'currency'
      },
      {
        prop: 'col6',
        colName: 'Col 6',
        type: 'currency'
      },
      {
        prop: 'col7',
        colName: 'Col 7',
        type: 'currency'
      },
      {
        prop: 'col8',
        colName: 'Col 8',
        type: 'currency'
      },
      {
        prop: 'col9',
        colName: 'Col 9',
        type: 'currency'
      },
    ],
    rowGroups: [
      {
        groupBy: 'belongsTo',
        name: (firstRowData) => firstRowData.name, // Optional
        indexType: 'romanNumeral',
        indexPattern: (currentIndex, parentIndex?) => {
          return `1.${currentIndex}`;
        },
      },
      {
        groupBy: 'sameId',
        name: (firstRowData) => firstRowData.name2, // Optional
        indexPattern: (currentIndex, parentIndex?) => {}, // Optional,
      },
      {
        groupBy: 'sameId2',
        name: (firstRowData) => firstRowData.name3, // Optional
        indexPattern: (currentIndex, parentIndex?) => {}, // Optional,
      }
    ],
  });

  constructor () { }

  ngOnInit () {
    console.log(this.data);
    this.configs.renameColumn(0, `hello <span style="color: red">2</span>`);
  }

}

import { Component, OnInit } from '@angular/core';
import { random } from 'lodash';
import { ColumnDescriptor } from '../../table';

@Component({
  selector: 'app-sheet-example',
  templateUrl: './sheet-example.component.html',
  styleUrls: ['./sheet-example.component.scss']
})
export class SheetExampleComponent implements OnInit {

  data = Array(50).fill(null).map((value, index) => (() => {
    if (index === 0) {
      return {
        total: 0,
        col1: 0,
        col2: 0,
        col3: 0,
        col4: 0,
        col5: 0,
        col6: 0,
        col7: 0,
        col8: 0,
        col9: 0,
      };
    }

    return {
      total: 0,
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
      type: 'currency'
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

  constructor () { }

  ngOnInit () {
  }

}

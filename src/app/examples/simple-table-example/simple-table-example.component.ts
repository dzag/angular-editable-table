import { Component, OnInit } from '@angular/core';
import { TableData } from 'src/app/table';
import { random } from 'lodash';

import { TableConfigurations } from 'src/app/table/core/table-configurations';

@Component({
  selector: 'app-simple-table-example',
  templateUrl: './simple-table-example.component.html',
  styleUrls: ['./simple-table-example.component.scss']
})
export class SimpleTableExampleComponent implements OnInit {

  configs = new TableConfigurations({
    columns: [
      {
        prop: 'total',
        name: 'Total',
        dataType: 'currency',
        headerClass: 'hello2',
        dataClass: 'hello',
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
          {id: 1, value: 'col 3-1'},
          {id: 2, value: 'col 3-2'},
          {id: 3, value: 'col 3-3'},
          {id: 4, value: 'col 3-4'},
        ],
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
        dataType: 'select',
        editable: true,
        editableWhen(row) {
          return !row.col3;
        },
        options: [
          {id: 1, value: 'hello 4'},
          {id: 2, value: 'hello 5'},
          {id: 3, value: 'hello 6'},
          {id: 4, value: 'hello 7'}
        ],
        partialOptions(row) {
          console.log(row);
          if (parseInt(row.col3, 10) < 3) {
            return [1, 2];
          }

          return [3, 4];
        }
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
    index: {
      show: true,
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
      },
    ],
    editing: {
      enabled: true,
      allowAdding: true,
    }
  });

  data = new TableData(Array(15).fill(null).map((value, index) => (() => {
    const id = random(1, 5);
    const subId = random(1, 3);
    const subId2 = random(1, 3);

    const randomDate = () => new Date(random(2000, 2018), random(0, 11), random(1, 29));

    return {
      total: 0,
      col1: random(100000000, 1000000000),
      col2: random(100000000, 1000000000),
      col3: id < 3 ? random(1, 2) : random(3, 4),
      col4: random(100000000, 1000000000),
      col5: random(1, 4),
      col6: random(100000000, 1000000000),
      col7: random(100000000, 1000000000),
      col8: randomDate()
    };
  })()));

  constructor () { }

  ngOnInit () {
  }

}

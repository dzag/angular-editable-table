import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: '[table-header]',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss']
})
export class TableHeaderComponent implements OnInit {

  @Input() headers;
  @Input() subHeaders;
  @Input() withIndex;
  @Input() class;
  @Input() prop;

  constructor() { }

  ngOnInit() {
  }

}

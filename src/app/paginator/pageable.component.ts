import { Component, OnInit } from '@angular/core';
import { PaginationService } from './pagination.service';

@Component({
  selector: 'pageable',
  template: '<ng-content></ng-content>',
  providers: [PaginationService]
})
export class PageableComponent implements OnInit {

  constructor () { }

  ngOnInit () {
  }

}

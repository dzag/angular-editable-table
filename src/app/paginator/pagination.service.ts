import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { merge } from 'lodash';

export interface CurrentPage {
  pageNumber: number;
  pageSize: number;
}

export interface InternalCurrentPage extends CurrentPage {
  $$fromUser: boolean;
}

export interface PageMetadata {
  $$totalPages: number;
  $$next: boolean;
  $$prev: boolean;
}

@Injectable()
export class PaginationService {

  private page$ = new BehaviorSubject<InternalCurrentPage>({
    pageNumber: 1,
    pageSize: 10,
    $$fromUser: false,
  });

  private metadata$ = new BehaviorSubject<PageMetadata>({
    $$totalPages: 10,
    $$next: true,
    $$prev: false,
  });

  private totalItems$ = new BehaviorSubject<number>(100);

  constructor() { }

  set(page: Partial<InternalCurrentPage>) {
    const newPage = this.mergePage(page);
    this.page$.next(newPage);
    this.calculateMeta();
  }

  setTotalItems(total: number) {
    this.totalItems$.next(total);
    this.calculateMeta();
  }

  getPage(noFilter?): Observable<CurrentPage> {
    const array = [
      filter<any>(page => !page.$$fromUser),
      map<any, any>(page => ({
        pageNumber: page.pageNumber,
        pageSize: page.pageSize
      }))
    ];
    if (noFilter) {
      array.shift();
    }
    const obs = this.page$.asObservable();

    return obs.pipe.apply(obs, array);
  }

  getMetadata(): Observable<PageMetadata> {
    return this.metadata$.asObservable();
  }

  getTotalItems(): Observable<number> {
    return this.totalItems$.asObservable();
  }

  next() {
    const next = this.page$.getValue().pageNumber + 1;
    this.set({ pageNumber: next });
  }

  previous() {
    const current = this.page$.getValue().pageNumber;
    const prev = current - 1 === 0 ? 1 : current - 1;
    this.set({ pageNumber: prev });
  }

  last() {
    const totalPages = this.metadata$.getValue().$$totalPages;
    this.set({ pageNumber: totalPages });
  }

  first() {
    this.set({ pageNumber: 1 });
  }

  private mergePage(newPage: Partial<InternalCurrentPage>) {
    const oldPage = { ...this.page$.getValue() };
    if (!Object.prototype.hasOwnProperty.call(newPage, '$$fromUser')) {
      newPage.$$fromUser = false;
    }
    merge(oldPage, newPage);
    return oldPage;
  }

  private calculateMeta() {
    const page = this.page$.getValue();
    let totalPage = page.pageSize !== 0 ? this.totalItems$.getValue() / page.pageSize : 0;
    totalPage = Math.ceil(!isNaN(totalPage) ? totalPage : 0);
    const canNext = page.pageNumber < totalPage;
    const canPrev = page.pageNumber > 1;
    this.metadata$.next({
      $$totalPages: totalPage,
      $$next: canNext,
      $$prev: canPrev
    });
  }

}

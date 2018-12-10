import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { merge } from 'lodash';

export interface CurrentPage {
  pageNumber: number;
  pageSize: number;
}

export interface PageMetadata {
  $$totalPages: number;
  $$next: boolean;
  $$prev: boolean;
}

@Injectable()
export class PaginationService {

  private page$ = new BehaviorSubject<CurrentPage>({
    pageNumber: 1,
    pageSize: 10,
  });

  private metadata$ = new BehaviorSubject<PageMetadata>({
    $$totalPages: 10,
    $$next: true,
    $$prev: false,
  });

  private totalItems$ = new BehaviorSubject<number>(100);

  constructor() { }

  set(page: Partial<CurrentPage>) {
    const newPage = this.mergePage(page);
    this.page$.next(newPage);
    this.calculateMeta();
  }

  setTotalItems(total: number) {
    this.totalItems$.next(total);
    this.calculateMeta();
  }

  getPage(): Observable<CurrentPage> {
    return this.page$.asObservable();
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

  select(prop: keyof CurrentPage) {
    return this.getPage().pipe(
      map(pageable => pageable[prop]),
      distinctUntilChanged(),
    );
  }

  private mergePage(page: Partial<CurrentPage>) {
    const newPage = { ...this.page$.getValue() };
    merge(newPage, page);
    return newPage;
  }

  private calculateMeta() {
    const page = this.page$.getValue();
    const totalPage = Math.ceil(this.totalItems$.getValue() / page.pageSize);
    const canNext = page.pageNumber < totalPage;
    const canPrev = page.pageNumber > 1;
    this.metadata$.next({
      $$totalPages: totalPage,
      $$next: canNext,
      $$prev: canPrev
    });
  }

}

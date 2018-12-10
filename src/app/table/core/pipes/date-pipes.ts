import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateToString' })
export class DateToStringPipe implements PipeTransform {

  transform(value: Date, args?: any): any {
    const date = value.getDate() < 10 ? `0${value.getDate()}` : value.getDate();
    let month = value.getMonth() + 1;
    const _month = month < 10 ? `0${month}` : month;
    return `${date}/${_month}/${value.getFullYear()}`;
  }

}

@Pipe({ name: 'stringToDate' })
export class StringToDatePipe implements PipeTransform {

  transform(value: string, args?: any): any {
    const [day, month, year] = value.split('/').map(part => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }

}

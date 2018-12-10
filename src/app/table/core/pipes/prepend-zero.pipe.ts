import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prependZero'
})
export class PrependZeroPipe implements PipeTransform {

  transform(value: number | string, args?: any): any {
    value = typeof value === 'string' ? parseInt(value, 10) : value;
    return value < 10 ? '0' + value : value;
  }

}

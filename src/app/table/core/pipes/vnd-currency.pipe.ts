import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'vnd',
  pure: true
})
export class VndCurrencyPipe implements PipeTransform {
  transform (value: number, ...args: any[]): any {
    const numberString = value.toString().replace('.', ',');
    const parts = numberString.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
  }
}

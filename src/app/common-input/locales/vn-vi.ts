// tslint:disable:comment-format binary-expression-operand-order max-line-length
// tslint:disable:no-bitwise prefer-template cyclomatic-complexity
// tslint:disable:no-shadowed-variable switch-default prefer-const
// tslint:disable:one-variable-per-declaration newline-before-return

import { LocaleData } from 'ngx-bootstrap/chronos/locale/locale.class';

export const vnViLocale: LocaleData = {
  abbr: 'vn-vi',
  months : 'Một_Hai_Ba_Bốn_Năm_Sáu_Bảy_Tám_Chín_Mười_Mười Một_Mười Hai'.split('_').map(m => `Tháng ${m}`),
  monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
  weekdays : 'Chủ Nhật_Hai_Ba_Bốn_Năm_Sáu_Bảy'.split('_'),
  weekdaysShort : 'CN_Hai_Ba_Bốn_Năm_Sáu_Bảy'.split('_'),
  weekdaysMin : 'CN_Hai_Ba_Bốn_Năm_Sáu_Bảy'.split('_'),
  longDateFormat : {
    LT : 'HH:mm',
    LTS : 'HH:mm:ss',
    L : 'MM/DD/YYYY',
    LL : 'D MMMM YYYY',
    LLL : 'D MMMM YYYY HH:mm',
    LLLL : 'dddd, MMMM YYYY HH:mm'
  },
  calendar : {
    sameDay : '[Hôm nay lúc] LT',
    nextDay : '[Ngày mai lúc] LT',
    nextWeek : 'dddd [lúc] LT',
    lastDay : '[Hôm qua lúc] LT',
    lastWeek : '[Ngày] dddd [lúc] LT',
    sameElse : 'L'
  },
  relativeTime : {
    future : 'in %s',
    past : '%s ago',
    s : 'a few seconds',
    ss : '%d seconds',
    m : 'a minute',
    mm : '%d minutes',
    h : 'an hour',
    hh : '%d hours',
    d : 'a day',
    dd : '%d days',
    M : 'a month',
    MM : '%d months',
    y : 'a year',
    yy : '%d years'
  },
  dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
  ordinal(_num: number): string {
    const num = Number(_num);
    const b = num % 10,
      output = (~~(num % 100 / 10) === 1) ? 'th' :
        (b === 1) ? 'st' :
          (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
    return num + output;
  },
  week : {
    dow : 1, // Monday is the first day of the week.
    doy : 4  // The week that contains Jan 4th is the first week of the year.
  }
};

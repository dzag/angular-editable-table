import {AbstractControl, ValidatorFn, Validators} from '@angular/forms';

const REGEX = {
    alphabetNummeric: /^[a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ0-9 \\s]*$/,
    alphabet: /^[a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ \\s]+$/,
    nummeric: /^[0-9]+$/,
};

export function CheckDataType(format: string = 'alphabet'): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (control.value) {
            if (format === 'alphabetNummeric') {
                if (!REGEX.alphabetNummeric.test(control.value)) {
                    return { formatError: true };
                }
            } else if (format === 'alphabet') {
                if (!REGEX.alphabet.test(control.value)) {
                    return { formatError: true };
                }
            } else if (format === 'nummeric') {
                if (!REGEX.nummeric.test(control.value)) {
                    return { formatError: true };
                }
            }
        }
        return null;
    };
}

    export function compareDate(fromDate: string, toDate: string): ValidatorFn {
        return (control: AbstractControl) => {
            const form = control.parent;
            if (!form) {
                return null;
            }
            const fromDateValue = form.get(fromDate).value;
            const toDateValue = form.get(toDate).value;
            if (fromDateValue && toDateValue && fromDateValue > toDateValue) {
                if (control === form.get(fromDate)) {
                    return {toDateAfterfromDate: true};
                }
            }
            if (control === form.get(toDate)) {
                form.get(fromDate).setValidators([Validators.required, compareDate(fromDate, toDate)]);
                form.get(fromDate).updateValueAndValidity();
            }
            return null;
        };
    }

// public noWhitespaceValidator(control: FormControl) {
//     const isWhitespace = (control.value || '').trim().length === 0;
//     const isValid = !isWhitespace;
//     return isValid ? null : { 'whitespace': true };
// }

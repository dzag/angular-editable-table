import { DATE_FORMAT } from './input-type-date/input-type-date.component';

export const MESSAGE_VALIDATION = {
};

export const MESSAGE_VALIDATION_RULE = {
    required: 'Nhập đầy đủ các thông tin bắt buộc!',
    maxlength: 'Too long',
    minlength: 'Too short',
    formatError: 'Sai định dạng',
    toDateAfterfromDate: 'Ngày kết thúc phải sau ngày bắt đầu',
    bsDate: `Nhập đúng định dạng ${DATE_FORMAT.toLowerCase()}`,
    guidelineExist: `Văn bản đã tồn tại trong hệ thống`,
    ngayBanHanh: `Ngày ban hành không thuộc năm kế hoạch`,
};





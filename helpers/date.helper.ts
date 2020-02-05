import moment = require('moment');

export class DateHelper {
    static  isAfterThanToday(date): boolean {
        const momentDate = moment(date, 'DD-MM-YYYY');
        const todayDate = moment();
        return momentDate.isAfter(todayDate);
    }
  
    static getDayOfWeek(date): number {
        const momentDate = moment(date, 'DD-MM-YYYY');
        const day = momentDate.day();
        return day;
    }
} 
import { Pipe, PipeTransform } from '@angular/core';
import TimeAgo from 'javascript-time-ago';
import 'javascript-time-ago/load-all-locales';
import { environment } from '../../environments/environment';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  private timer: number | null;

  transform(value: string) {
    const timeAgo = new TimeAgo(environment.locale);
    return timeAgo.format(new Date(value));
  }
}

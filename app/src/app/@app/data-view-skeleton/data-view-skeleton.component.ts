import { Component, signal } from '@angular/core';
import {  Skeleton } from '@ngstarter-ui/components/skeleton';

@Component({
  selector: 'app-data-view-skeleton',
  imports: [

    Skeleton
  ],
  templateUrl: './data-view-skeleton.component.html',
  styleUrl: './data-view-skeleton.component.scss'
})
export class DataViewSkeletonComponent {
  rowsRepeatCount = signal([1, 2, 3, 4, 5, 6, 7, 8]);
}

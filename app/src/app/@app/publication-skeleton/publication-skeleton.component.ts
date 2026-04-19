import { Component } from '@angular/core';
import { Skeleton } from '@ngstarter/components/skeleton';
import { Divider } from '@ngstarter/components/divider';

@Component({
  selector: 'app-publication-skeleton',
  imports: [
    Divider,
    Skeleton
  ],
  templateUrl: './publication-skeleton.component.html',
  styleUrl: './publication-skeleton.component.scss'
})
export class PublicationSkeletonComponent {
}

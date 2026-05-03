import { Component, input, OnInit, output } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card, CardActions, CardContent, CardHeader, CardImage, CardTitle } from '@ngstarter-ui/components/card';
import { ImagePlaceholder } from '@ngstarter-ui/components/image-placeholder';

@Component({
  selector: 'app-image-design-card',
  imports: [
    Button,
    Icon,
    TranslocoPipe,
    Card,
    CardActions,
    CardImage,
    CardTitle,
    CardHeader,
    ImagePlaceholder
  ],
  templateUrl: './image-design-card.html',
  styleUrl: './image-design-card.scss',
})
export class ImageDesignCard implements OnInit {
  imageDesign = input.required<any>();

  readonly edit = output<number>();
  readonly delete = output<number>();

  ngOnInit() {
    // console.log('Cover design card initialized with:', this.imageDesign());
  }
}

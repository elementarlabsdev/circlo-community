import { Component } from '@angular/core';
import { Divider } from '@ngstarter/components/divider';
import { Badge } from '@ngstarter/components/badge';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';
import { Tooltip } from '@ngstarter/components/tooltip';
import { Dicebear } from '@ngstarter/components/avatar';

@Component({
  selector: 'app-sidebar-toolbar',
  standalone: true,
  imports: [
    Divider,
    Badge,
    Icon,
    Button,
    Tooltip,
    Dicebear
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {

}

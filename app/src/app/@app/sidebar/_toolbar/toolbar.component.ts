import { Component } from '@angular/core';
import { Divider } from '@ngstarter-ui/components/divider';
import { Badge } from '@ngstarter-ui/components/badge';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { Dicebear } from '@ngstarter-ui/components/avatar';

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

import {
  Component, inject, model,
} from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { FormsModule } from '@angular/forms';
import { Button } from '@ngstarter/components/button';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { FormField, IconButtonSuffix, IconPrefix } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';

@Component({
  selector: 'app-assistant-search',
  standalone: true,
  imports: [
    Icon,
    FormsModule,
    Button,
    TranslocoPipe,
    FormField,
    Input,
    IconButtonSuffix,
    IconPrefix,
  ],
  templateUrl: './assistant-search.component.html',
  styleUrl: './assistant-search.component.scss',
  host: {
    'class': 'assistant-search'
  }
})
export class AssistantSearchComponent {
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  protected searchText = model(this._route.snapshot.queryParams['query']);

  onSubmit() {
    this._router.navigate(['/search'], {
      queryParams: {
        query: this.searchText()
      }
    });
  }

  clearText() {
    this.searchText.set('');
  }
}

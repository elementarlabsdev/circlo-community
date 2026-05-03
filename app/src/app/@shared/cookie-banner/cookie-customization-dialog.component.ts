import { Component, inject } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { Icon } from '@ngstarter-ui/components/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';
import {
  DIALOG_DATA,
  Dialog,
  DialogRef,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@ngstarter-ui/components/dialog';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelDescription,
  ExpansionPanelHeader, ExpansionPanelTitle
} from '@ngstarter-ui/components/expansion';

export interface CookieCategory {
  id: number;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  isMandatory: boolean;
  isExpanded: boolean;
}

export interface CookiePreferences {
  [key: string]: boolean;
}

export interface CookieCustomizationResult {
  action: 'acceptNecessary' | 'savePreferences' | 'close';
  preferences?: CookiePreferences;
}

@Component({
  selector: 'app-cookie-customization-dialog',
  standalone: true,
  imports: [
    Button,
    SlideToggle,
    Icon,
    TranslocoModule,
    FormsModule,
    DialogTitle,
    DialogContent,
    Accordion,
    ExpansionPanel,
    ExpansionPanelDescription,
    ExpansionPanelHeader,
    DialogActions,
    ExpansionPanelTitle,
  ],
  templateUrl: './cookie-customization-dialog.component.html',
  styleUrl: './cookie-banner.component.scss'
})
export class CookieCustomizationDialogComponent {
  private dialogRef = inject(DialogRef<CookieCustomizationDialogComponent>);
  data = inject<{ preferences: CookiePreferences, categories: CookieCategory[], settings: any }>(DIALOG_DATA);

  expanded: { [key: number]: boolean } = {};
  preferences: CookiePreferences = { ...this.data.preferences };

  constructor() {
    this.data.categories.forEach(category => {
      this.expanded[category.id] = category.isExpanded;
      if (category.isMandatory) {
        this.preferences[category.id] = true;
      } else if (this.preferences[category.id] === undefined) {
        this.preferences[category.id] = false;
      }
    });
  }

  close() {
    this.dialogRef.close({ action: 'close' });
  }

  acceptNecessary() {
    const prefs: CookiePreferences = {};
    this.data.categories.forEach(category => {
      prefs[category.id] = category.isMandatory;
    });
    this.dialogRef.close({
      action: 'acceptNecessary',
      preferences: prefs
    });
  }

  savePreferences() {
    this.dialogRef.close({
      action: 'savePreferences',
      preferences: this.preferences
    });
  }
}

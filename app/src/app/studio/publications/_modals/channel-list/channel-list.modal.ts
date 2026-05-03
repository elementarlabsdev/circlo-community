import { Component, inject, model, OnInit, signal } from '@angular/core';
import {
  DIALOG_DATA,
  DialogActions,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter-ui/components/dialog';
import { Button } from '@ngstarter-ui/components/button';
import { ApiService } from '@services/api.service';
import { Input } from '@ngstarter-ui/components/input';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Channel } from '@model/interfaces';
import { FormsModule } from '@angular/forms';
import {
  PanelContent,
  Panel,
  PanelFooter,
  PanelHeader
} from '@ngstarter-ui/components/panel';
import { Paginator, PageEvent } from '@ngstarter-ui/components/paginator';
import { ListOption, SelectionList } from '@ngstarter-ui/components/list';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-channel-list',
  imports: [
    DialogTitle,
    Button,
    DialogActions,
    DialogContent,
    FormField,
    Label,
    Input,
    FormsModule,
    Panel,
    PanelHeader,
    PanelFooter,
    PanelContent,
    Paginator,
    ListOption,
    SelectionList,
    RouterLink,
    TranslocoPipe,
  ],
  templateUrl: './channel-list.modal.html',
  styleUrl: './channel-list.modal.scss'
})
export class ChannelListModal implements OnInit {
  private dialogRef = inject(DialogRef);
  private data = inject(DIALOG_DATA);
  private api = inject(ApiService);

  channels = signal<Channel[]>([]);
  selectedChannel = model<Channel | null>(this.data.channel || null);
  query = model('');
  totalCount = signal(0);
  pageNumber = signal(1);

  ngOnInit() {
    this.api
      .get('studio/channel-list', {
        pageNumber: this.pageNumber(),
        query: this.query(),
        pageSize: 20
      })
      .subscribe((res: any) => {
        this.totalCount.set(res.pagination.totalCount);
        this.channels.set(res.pagination.items);
      });
  }

  selectChannel(channel: Channel | null) {
    this.selectedChannel.set(channel);
  }

  cancel() {
    this.dialogRef.close();
  }

  apply() {
    this.dialogRef.close(this.selectedChannel());
  }

  onPageChange(event: PageEvent) {
    this.pageNumber.set(event.pageIndex + 1);
  }
}

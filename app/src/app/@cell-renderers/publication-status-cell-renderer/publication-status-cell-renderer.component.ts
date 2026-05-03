import { Component, input, OnInit } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';

@Component({
  selector: 'app-publication-status-cell-renderer',
  standalone: true,
  imports: [],
  templateUrl: './publication-status-cell-renderer.component.html',
  styleUrl: './publication-status-cell-renderer.component.scss'
})
export class PublicationStatusCellRendererComponent implements DataViewCellRenderer, OnInit {
  element = input();
  columnDef = input();
  fieldData = input<any>();

  ngOnInit() {
    // console.log(this.fieldData());
  }
}

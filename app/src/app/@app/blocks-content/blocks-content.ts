import { Component, input, OnInit } from '@angular/core';
import { Divider } from '@ngstarter/components/divider';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { SafeHtmlPipe, SafeResourceUrlPipe } from '@ngstarter/components/core';
import { ContentEditorBlock } from '@ngstarter/components/content-editor';
import { CodeHighlighter } from '@ngstarter/components/code-highlighter';
import { ImageZoomViewer, ImageZoomViewerImage } from '@ngstarter/components/image-zoom-viewer';
import { NativeTable } from '@ngstarter/components/table';
import {VideoPlayer} from "@ngstarter/components/video-player";

@Component({
  selector: 'app-blocks-content',
  imports: [
    Divider,
    ImageProxyPipe,
    SafeHtmlPipe,
    SafeResourceUrlPipe,
    CodeHighlighter,
    ImageZoomViewer,
    NativeTable,
    ImageZoomViewerImage,
    VideoPlayer
  ],
  templateUrl: './blocks-content.html',
  styleUrl: './blocks-content.scss',
})
export class BlocksContent implements OnInit {
  blocksContent = input.required<ContentEditorBlock[]>();

  ngOnInit() {
    // console.log(this.blocksContent());
  }
}

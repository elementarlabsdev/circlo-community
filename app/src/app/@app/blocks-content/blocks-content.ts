import { Component, input, OnInit } from '@angular/core';
import { Divider } from '@ngstarter-ui/components/divider';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { SafeHtmlPipe, SafeResourceUrlPipe } from '@ngstarter-ui/components/core';
import { ContentEditorBlock } from '@ngstarter-ui/components/content-editor';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { ImageZoomViewer, ImageZoomViewerImage } from '@ngstarter-ui/components/image-zoom-viewer';
import { NativeTable } from '@ngstarter-ui/components/table';
import {VideoPlayer} from "@ngstarter-ui/components/video-player";

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

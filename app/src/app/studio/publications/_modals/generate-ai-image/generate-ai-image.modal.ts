import { Component, inject, signal } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import {
  DIALOG_DATA,
  DialogActions,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter/components/dialog';
import { ApiService } from '@services/api.service';
import { GoogleGenAI } from '@google/genai';
import { Alert } from '@ngstarter/components/alert';
import { Card, CardContent, CardImage } from '@ngstarter/components/card';
// import { generateText } from 'ai';
// import { openai } from '@ai-sdk/openai';
// import { google } from '@ai-sdk/google';
import { BlockLoader } from '@ngstarter/components/block-loader';
import { RadioButton, RadioGroup } from '@ngstarter/components/radio';
import { FormsModule } from '@angular/forms';
import { CardOverlay, CardOverlayContainerDirective } from '@ngstarter/components/card-overlay';

// const { text } = await generateText({
//   model: openai('gpt-4o'),
//   system: 'You are a friendly assistant!',
//   prompt: 'Why is the sky blue?',
// });

interface PreviewImage {
  src: string;
  mimeType: string;
  loaded: boolean;
}

@Component({
  imports: [
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert,
    Card,
    BlockLoader,
    RadioButton,
    RadioGroup,
    FormsModule,
    CardOverlay,
    CardOverlayContainerDirective
  ],
  templateUrl: './generate-ai-image.modal.html',
  styleUrl: './generate-ai-image.modal.scss'
})
export class GenerateAiImageModal {
  private dialogRef = inject(DialogRef);
  private data = inject(DIALOG_DATA);
  private api = inject(ApiService);

  loading = signal(false);
  error = signal('');
  src = signal('');
  previewImages = signal<PreviewImage[]>([]);
  loaded = signal(false);
  providers = signal<any[]>([]);
  currentProvider = signal<any | null>(null);
  numberOfImages = signal(1);

  async ngOnInit() {
    this.api
      .get('studio/account/ai-providers/my')
      .subscribe((res: any) => {
        this.providers.set(res.providers);
        this.loaded.set(true);

        if (res.providers.length > 0) {
          this.currentProvider.set(res.providers[0]);
          this.generate();
        }
      });
  }

  async refresh() {
    this.loading.set(true);
    await this.generate();
  }

  cancel() {
    this.dialogRef.close();
  }

  selectImage(previewImage: PreviewImage) {
    this.dialogRef.close({
      src: 'data:' + previewImage.mimeType + ';base64,' + previewImage.src,
      mimeType: previewImage.mimeType
    });
  }

  private async generate() {
    this.error.set('');

    if (!this.currentProvider()) {
      return;
    }

    if (this.currentProvider().type === 'gemini') {
      await this.generateWithGemini();
    }
  }

  private async generateWithGemini() {
    try {
      const images: PreviewImage[] = [];

      for (let i = 0; i < this.numberOfImages(); i++) {
        images.push({
          loaded: false,
          src: '',
          mimeType: '',
        });
      }

      this.previewImages.set(images);

      const ai = new GoogleGenAI({
        apiKey: this.currentProvider().apiKey,
      });
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: `Generate an image illustration for a blog post (feature image) with title "${this.data.title}."`,
        config: {
          numberOfImages: this.numberOfImages(),
          aspectRatio: '16:9',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const images: PreviewImage[] = [];
        for (const generatedImage of response.generatedImages) {
          const src = (generatedImage as any).image.imageBytes as string;
          const mimeType = (generatedImage as any).image.mimeType as string;
          images.push({
            loaded: true,
            src: 'data:' + mimeType + ';base64,' + src,
            mimeType,
          });
        }
        this.previewImages.set(images);
        this.loading.set(false);
      }
    } catch (e: any) {
      this.loading.set(false);
      this.error.set(e.message);
    }
  }
}

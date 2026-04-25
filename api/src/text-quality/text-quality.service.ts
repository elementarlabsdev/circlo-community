import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { pipeline, env } from '@huggingface/transformers';
import { franc } from 'franc-min';
import { iso6393 } from 'iso-639-3';
import { join } from 'path';

// Настройка окружения для трансформаторов
env.allowLocalModels = true;
env.allowRemoteModels = true;
env.localModelPath = join(process.cwd(), 'temp');
env.cacheDir = join(process.cwd(), 'temp');
env.useBrowserCache = false;
env.useFSCache = true;

export interface QualityScore {
  sentimentScore: number;
  toxicityScore: number;
  spamScore: number;
  aiGeneratedScore: number;
  coherenceScore: number;
  readabilityScore: number;
  language: string;
  overallScore: number;
}

@Injectable()
export class TextQualityService {
  private readonly logger = new Logger(TextQualityService.name);
  private static models: Record<string, Promise<any>> = {};

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.logger.log('TextQualityService initialized');
  }

  async analyze(text: string): Promise<QualityScore> {
    if (!text || text.trim().length === 0) {
      return this.emptyScore();
    }

    const language = this.detectLanguage(text);
    const chunks = this.splitIntoChunks(text, 500);
    const results = await Promise.all(
      chunks.map((chunk) => this.analyzeChunk(chunk, language)),
    );

    const averaged = this.averageResults(results);
    averaged.language = language;
    averaged.overallScore = this.calculateOverallScore(averaged);

    return averaged;
  }

  private detectLanguage(text: string): string {
    const code = franc(text);
    return code === 'und' ? 'eng' : code;
  }

  private async translateToEn(text: string): Promise<string> {
    try {
      const srcLang = this.detectLanguage(text);
      if (srcLang === 'eng') {
        return text;
      }

      const translator = await this.getModel(
        'translation',
        'Xenova/nllb-200-distilled-600M',
      );

      const output = await translator(text, {
        src_lang: this.mapToNllbLanguage(srcLang),
        tgt_lang: 'eng_Latn',
      });

      return output[0]?.translation_text || text;
    } catch (error) {
      this.logger.error('Translation error', error);
      return text;
    }
  }

  private mapToNllbLanguage(code: string): string {
    // По умолчанию для большинства языков используется латиница.
    // NLLB использует формат ISO 639-3 + "_" + ISO 15924 Script.
    const language = iso6393.find((l) => l.iso6393 === code);
    if (!language) return 'eng_Latn';

    // Некоторые исключения для скриптов, которые часто не латиница
    const scriptMap: Record<string, string> = {
      rus: 'Cyrl',
      zho: 'Hans',
      jpn: 'Jpan',
      kor: 'Kore',
      ara: 'Arab',
      hin: 'Deva',
      ell: 'Grek',
      heb: 'Hebr',
      ben: 'Beng',
      urd: 'Arab',
      fas: 'Arab',
      ukr: 'Cyrl',
      bel: 'Cyrl',
      bul: 'Cyrl',
      mkd: 'Cyrl',
      srp: 'Cyrl',
      tha: 'Thai',
      khm: 'Khmr',
      lao: 'Laoo',
      mya: 'Mymr',
      kat: 'Geor',
      hye: 'Armn',
      tam: 'Taml',
      tel: 'Telu',
      kan: 'Knda',
      mal: 'Mlym',
      guj: 'Gujr',
      pan: 'Guru',
      sin: 'Sinh',
      ckb: 'Arab',
      pes: 'Arab',
    };

    const script = scriptMap[code] || 'Latn';
    const nllbCode = `${code}_${script}`;

    // Valid codes from NLLB-200 distilled 600M
    const validCodes = new Set([
      'ace_Arab',
      'ace_Latn',
      'acm_Arab',
      'acq_Arab',
      'aeb_Arab',
      'afr_Latn',
      'ajp_Arab',
      'aka_Latn',
      'amh_Ethi',
      'apc_Arab',
      'arb_Arab',
      'ars_Arab',
      'ary_Arab',
      'arz_Arab',
      'asm_Beng',
      'ast_Latn',
      'awa_Deva',
      'ayr_Latn',
      'azb_Arab',
      'azj_Latn',
      'bak_Cyrl',
      'bam_Latn',
      'ban_Latn',
      'bel_Cyrl',
      'bem_Latn',
      'ben_Beng',
      'bho_Deva',
      'bjn_Arab',
      'bjn_Latn',
      'bod_Tibt',
      'bos_Latn',
      'bug_Latn',
      'bul_Cyrl',
      'cat_Latn',
      'ceb_Latn',
      'ces_Latn',
      'cjk_Latn',
      'ckb_Arab',
      'crh_Latn',
      'cym_Latn',
      'dan_Latn',
      'deu_Latn',
      'dik_Latn',
      'dyu_Latn',
      'dzo_Tibt',
      'ell_Grek',
      'eng_Latn',
      'epo_Latn',
      'est_Latn',
      'eus_Latn',
      'ewe_Latn',
      'fao_Latn',
      'pes_Arab',
      'fij_Latn',
      'fin_Latn',
      'fon_Latn',
      'fra_Latn',
      'fur_Latn',
      'fuv_Latn',
      'gla_Latn',
      'gle_Latn',
      'glg_Latn',
      'grn_Latn',
      'guj_Gujr',
      'hat_Latn',
      'hau_Latn',
      'heb_Hebr',
      'hin_Deva',
      'hne_Deva',
      'hrv_Latn',
      'hun_Latn',
      'hye_Armn',
      'ibo_Latn',
      'ilo_Latn',
      'ind_Latn',
      'isl_Latn',
      'ita_Latn',
      'jav_Latn',
      'jpn_Jpan',
      'kab_Latn',
      'kac_Latn',
      'kam_Latn',
      'kan_Knda',
      'kas_Arab',
      'kas_Deva',
      'kat_Geor',
      'knc_Arab',
      'knc_Latn',
      'kaz_Cyrl',
      'kbp_Latn',
      'kea_Latn',
      'khm_Khmr',
      'kik_Latn',
      'kin_Latn',
      'kir_Cyrl',
      'kmb_Latn',
      'kon_Latn',
      'kor_Hang',
      'kmr_Latn',
      'lao_Laoo',
      'lvs_Latn',
      'lij_Latn',
      'lim_Latn',
      'lin_Latn',
      'lit_Latn',
      'lmo_Latn',
      'ltg_Latn',
      'ltz_Latn',
      'lua_Latn',
      'lug_Latn',
      'luo_Latn',
      'lus_Latn',
      'mag_Deva',
      'mai_Deva',
      'mal_Mlym',
      'mar_Deva',
      'min_Latn',
      'mkd_Cyrl',
      'plt_Latn',
      'mlt_Latn',
      'mni_Beng',
      'khk_Cyrl',
      'mos_Latn',
      'mri_Latn',
      'zsm_Latn',
      'mya_Mymr',
      'nld_Latn',
      'nno_Latn',
      'nob_Latn',
      'npi_Deva',
      'nso_Latn',
      'nus_Latn',
      'nya_Latn',
      'oci_Latn',
      'gaz_Latn',
      'ory_Orya',
      'pag_Latn',
      'pan_Guru',
      'pap_Latn',
      'pol_Latn',
      'por_Latn',
      'prs_Arab',
      'pbt_Arab',
      'quy_Latn',
      'ron_Latn',
      'run_Latn',
      'rus_Cyrl',
      'sag_Latn',
      'san_Deva',
      'sat_Beng',
      'scn_Latn',
      'shn_Mymr',
      'sin_Sinh',
      'slk_Latn',
      'slv_Latn',
      'smo_Latn',
      'sna_Latn',
      'snd_Arab',
      'som_Latn',
      'sot_Latn',
      'spa_Latn',
      'als_Latn',
      'srd_Latn',
      'srp_Cyrl',
      'ssw_Latn',
      'sun_Latn',
      'swe_Latn',
      'swh_Latn',
      'szl_Latn',
      'tam_Taml',
      'tat_Cyrl',
      'tel_Telu',
      'tgk_Cyrl',
      'tgl_Latn',
      'tha_Thai',
      'tir_Ethi',
      'taq_Latn',
      'taq_Tfng',
      'tpi_Latn',
      'tsn_Latn',
      'tso_Latn',
      'tuk_Latn',
      'tum_Latn',
      'tur_Latn',
      'twi_Latn',
      'tzm_Tfng',
      'uig_Arab',
      'ukr_Cyrl',
      'umb_Latn',
      'urd_Arab',
      'uzn_Latn',
      'vec_Latn',
      'vie_Latn',
      'war_Latn',
      'wol_Latn',
      'xho_Latn',
      'ydd_Hebr',
      'yor_Latn',
      'yue_Hant',
      'zho_Hans',
      'zho_Hant',
      'zul_Latn',
    ]);

    return validCodes.has(nllbCode) ? nllbCode : 'eng_Latn';
  }

  private splitIntoChunks(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += maxLength) {
      chunks.push(text.slice(i, i + maxLength));
    }
    return chunks;
  }

  private async analyzeChunk(
    text: string,
    language: string,
  ): Promise<Omit<QualityScore, 'language' | 'overallScore'>> {
    const translated =
      language !== 'eng' ? await this.translateToEn(text) : text;
    const sentiment = await this.getSentiment(translated);
    const toxicity = await this.getToxicity(translated);
    const spam = await this.getSpamScore(translated);
    const aiGenerated = await this.getAiGeneratedScore(translated);
    const coherence = await this.getCoherence(translated);
    const readability = this.calculateReadability(translated);

    return {
      sentimentScore: sentiment,
      toxicityScore: toxicity,
      spamScore: spam,
      aiGeneratedScore: aiGenerated,
      coherenceScore: coherence,
      readabilityScore: readability,
    };
  }

  private async getModel(task: any, modelName: string) {
    if (!TextQualityService.models[modelName]) {
      TextQualityService.models[modelName] = (async () => {
        this.logger.log(`Loading model ${modelName}...`);
        await this.cacheManager.set('text-quality:models-loading', true, 60000); // 1 minute
        try {
          const model = await pipeline(task, modelName, {
            dtype: 'q8',
          });
          return model;
        } catch (error) {
          this.logger.error(
            `Failed to load model ${modelName}: ${error.message}`,
            error.stack,
          );
          delete TextQualityService.models[modelName];
          throw error;
        } finally {
          // Note: we don't clear text-quality:models-loading here because
          // other models might still be loading in parallel or in sequence.
          // It will expire by TTL.
        }
      })();
    }
    return TextQualityService.models[modelName];
  }

  private async getSentiment(text: string): Promise<number> {
    try {
      const classifier = await this.getModel(
        'sentiment-analysis',
        'Xenova/bert-base-multilingual-uncased-sentiment',
      );
      const result = await classifier(text);
      // Модель возвращает звезды 1-5.
      const label = result[0].label; // "1 star", "2 stars" ...
      const stars = parseInt(label[0]);
      return stars;
    } catch (e) {
      this.logger.error('Sentiment analysis error', e);
      return 3;
    }
  }

  private async getToxicity(text: string): Promise<number> {
    try {
      const classifier = await this.getModel(
        'text-classification',
        'Xenova/toxic-bert',
      );
      const result = await classifier(text);
      const toxicLabel = result.find((r: any) => r.label === 'toxic');
      return toxicLabel ? toxicLabel.score : 0;
    } catch (e) {
      this.logger.error('Toxicity analysis error', e);
      return 0;
    }
  }

  private async getSpamScore(text: string): Promise<number> {
    try {
      const classifier = await this.getModel(
        'text-classification',
        'onnx-community/tanaos-spam-detection-v1-ONNX',
      );
      const result = await classifier(text);
      // Модель onnx-community/tanaos-spam-detection-v1-ONNX использует метки:
      // spam
      // not_spam
      const spamLabel = result.find(
        (r: any) =>
          r.label === 'spam' ||
          r.label === 'LABEL_1' ||
          (r.label.toLowerCase().includes('spam') &&
            !r.label.toLowerCase().includes('not_spam')),
      );
      return spamLabel ? spamLabel.score : 0;
    } catch (e) {
      return 0.1; // Default
    }
  }

  private async getAiGeneratedScore(text: string): Promise<number> {
    try {
      // Для AI detection используем nicoamoretti/roberta-ai-detector-onnx
      const classifier = await this.getModel(
        'text-classification',
        'nicoamoretti/roberta-ai-detector-onnx',
      );
      const result = await classifier(text);
      // Модель nicoamoretti/roberta-ai-detector-onnx использует метки:
      // Fake (0)
      // Real (1)
      const fakeLabel = result.find(
        (r: any) =>
          r.label === 'Fake' ||
          r.label === 'LABEL_0' ||
          r.label.toLowerCase().includes('fake'),
      );
      return fakeLabel ? fakeLabel.score : 0.5;
    } catch (e) {
      return 0.5;
    }
  }

  private async getCoherence(text: string): Promise<number> {
    try {
      const sentences = text
        .split(/[.!?]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 5);

      if (sentences.length <= 1) {
        return 1.0;
      }

      const extractor = await this.getModel(
        'feature-extraction',
        'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
      );

      const embeddings = await Promise.all(
        sentences.map(async (s) => {
          const result = await extractor(s, {
            pooling: 'mean',
            normalize: true,
          });
          return result.data;
        }),
      );

      let totalSimilarity = 0;
      for (let i = 0; i < embeddings.length - 1; i++) {
        totalSimilarity += this.cosineSimilarity(
          embeddings[i],
          embeddings[i + 1],
        );
      }

      const avgSimilarity = totalSimilarity / (embeddings.length - 1);
      return Math.max(0, Math.min(1, avgSimilarity));
    } catch (e) {
      this.logger.error('Coherence analysis error', e);
      return 0.7;
    }
  }

  private cosineSimilarity(
    vecA: number[] | Float32Array,
    vecB: number[] | Float32Array,
  ): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private calculateReadability(text: string): number {
    // Упрощенный расчет на основе длины слов и предложений (аналог Flesch-Kincaid)
    const words = text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordLen = text.length / words;

    if (words === 0) return 0;

    // Индекс читаемости (чем меньше слов на предложение и короче слова, тем проще читать)
    // Нормализуем к 0-1.
    let score = (sentences / words) * 10 - avgWordLen / 10;
    return Math.max(0, Math.min(1, 0.5 + score));
  }

  private calculateOverallScore(
    scores: Omit<QualityScore, 'language' | 'overallScore'>,
  ): number {
    const normalizedSentiment = (scores.sentimentScore - 1) / 4;
    const score =
      normalizedSentiment * 0.2 +
      (1 - scores.toxicityScore) * 0.25 +
      scores.readabilityScore * 0.15 +
      scores.coherenceScore * 0.2 +
      (1 - scores.spamScore) * 0.1 +
      (1 - scores.aiGeneratedScore) * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  private averageResults(results: any[]): any {
    const count = results.length;
    const sum = results.reduce((acc, curr) => {
      for (const key in curr) {
        acc[key] = (acc[key] || 0) + curr[key];
      }
      return acc;
    }, {});

    for (const key in sum) {
      sum[key] /= count;
    }
    return sum;
  }

  private emptyScore(): QualityScore {
    return {
      sentimentScore: 3,
      toxicityScore: 0,
      spamScore: 0,
      aiGeneratedScore: 0,
      coherenceScore: 1,
      readabilityScore: 1,
      language: 'eng',
      overallScore: 1,
    };
  }
}

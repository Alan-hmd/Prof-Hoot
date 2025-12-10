// Audio Utilities for decoding PCM from Gemini

export class AudioController {
  private audioContext: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentSource: AudioBufferSourceNode | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000, // Gemini TTS often returns 24kHz
      });
    }
    return this.audioContext;
  }

  // Base64 decoding helper
  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Convert PCM Int16 to Float32 AudioBuffer
  private async decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  public async playAudio(base64Audio: string): Promise<void> {
    try {
      this.stop(); // Stop any previous audio
      const ctx = this.getContext();
      
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const bytes = this.decodeBase64(base64Audio);
      const audioBuffer = await this.decodeAudioData(bytes, ctx);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      this.currentSource = source;
      this.isPlaying = true;

      return new Promise((resolve) => {
        source.onended = () => {
          this.isPlaying = false;
          this.currentSource = null;
          resolve();
        };
        source.start();
      });

    } catch (error) {
      console.error("Audio playback error:", error);
      this.isPlaying = false;
    }
  }

  public stop() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      this.currentSource = null;
    }
    this.isPlaying = false;
  }
}

export const audioController = new AudioController();

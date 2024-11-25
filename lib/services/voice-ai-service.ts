import { type VoiceConfig } from 'lib/types';
import { ElevenLabsAPI } from './elevenlabs-service';
import { TwilioService } from './twilio-service';

export class VoiceAIService {
  private static config: VoiceConfig = {
    defaultGreeting: "Hello, thank you for calling. How can I help you today?",
    voiceId: "",
    useCustomVoice: false,
    maxRecordingDuration: 300,
    transcribeRecordings: true,
  };

  static setConfig(config: Partial<VoiceConfig>) {
    this.config = { ...this.config, ...config };
  }

  static async handleIncomingCall(
    callSid: string,
    callerNumber: string
  ): Promise<string> {
    try {
      const voiceType = this.config.useCustomVoice ? 'alice' : 'neural';
      const greeting = this.config.defaultGreeting;

      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="3" language="en-US">
    <Say voice="${voiceType}">${greeting}</Say>
  </Gather>
  <Record transcribe="true" maxLength="${this.config.maxRecordingDuration}" />
</Response>`;
    } catch (error) {
      console.error('Error handling incoming call:', error);
      throw error;
    }
  }

  static async handleSpeechInput(
    callSid: string,
    speechResult: string
  ): Promise<string> {
    try {
      const response = await this.processAIResponse(speechResult);
      const voiceType = this.config.useCustomVoice ? 'alice' : 'neural';

      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voiceType}">${response}</Say>
  <Gather input="speech" timeout="3" language="en-US" />
</Response>`;
    } catch (error) {
      console.error('Error handling speech input:', error);
      throw error;
    }
  }

  static async handleRecording(
    callSid: string,
    recordingUrl: string,
    transcription?: string
  ): Promise<void> {
    try {
      await TwilioService.storeCallRecording(callSid, recordingUrl);
      
      if (transcription) {
        await TwilioService.storeCallTranscription(callSid, transcription);
      }
    } catch (error) {
      console.error('Error handling recording:', error);
      throw error;
    }
  }

  private static async processAIResponse(input: string): Promise<string> {
    return "I understand you're interested in our services. Would you like to schedule a consultation?";
  }

  static async synthesizeVoice(text: string, voiceId: string): Promise<string> {
    try {
      return await ElevenLabsAPI.synthesizeSpeech(text, voiceId);
    } catch (error) {
      console.error('Error synthesizing voice:', error);
      throw error;
    }
  }
}
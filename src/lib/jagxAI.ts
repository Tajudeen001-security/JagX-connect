/**
 * JagX AI client — wraps the JagX AI API (https://jagx-ai-v2.onrender.com).
 *
 * SETUP:
 *   Add to .env:
 *     VITE_JAGX_AI_BASE_URL=https://jagx-ai-v2.onrender.com
 *     VITE_JAGX_AI_API_KEY=your-jagx-api-key
 *
 * ⚠️ SECURITY NOTE
 * VITE_ env vars are bundled straight into the client JS (and into the
 * Capacitor Android/iOS build). Anyone can pull VITE_JAGX_AI_API_KEY back
 * out of your shipped app — via browser dev tools on web, or by
 * unzipping/decompiling the .apk on mobile. That's fine for a low-value,
 * rate-limited key you don't mind rotating if it leaks. It is NOT fine if
 * this key has real cost or abuse potential (image/video generation
 * usually does).
 *
 * The safer pattern: keep this key server-side only, behind a Supabase
 * Edge Function that holds the key as a secret and the app calls THAT
 * instead of calling jagx-ai-v2.onrender.com directly. Say the word and
 * I'll write that proxy function — it's short — and point
 * VITE_JAGX_AI_BASE_URL at it instead.
 */

const JAGX_AI_BASE_URL = import.meta.env.VITE_JAGX_AI_BASE_URL || 'https://jagx-ai-v2.onrender.com';
const JAGX_AI_API_KEY = import.meta.env.VITE_JAGX_AI_API_KEY || '';

export const isJagxAIConfigured = (): boolean => Boolean(JAGX_AI_API_KEY);

const authHeaders = (extra?: Record<string, string>) => ({
  'x-api-key': JAGX_AI_API_KEY,
  ...extra,
});

const assertConfigured = () => {
  if (!isJagxAIConfigured()) {
    throw new Error(
      'JagX AI is not configured. Set VITE_JAGX_AI_API_KEY in .env (see src/lib/jagxAI.ts).'
    );
  }
};

async function parseOrThrow(res: Response) {
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`JagX AI request failed (${res.status}): ${errText}`);
  }
  return res.json();
}

// ---- Chat ----
export interface ChatResult {
  response: string;
}

export const jagxChat = async (message: string, maxTokens = 700): Promise<ChatResult> => {
  assertConfigured();
  const res = await fetch(`${JAGX_AI_BASE_URL}/chat`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ message, max_tokens: maxTokens }),
  });
  return parseOrThrow(res);
};

// ---- Image generation ----
export interface ImageResult {
  success: boolean;
  source: string;
  image_base64: string;
  format: string;
}

export const jagxGenerateImage = async (
  prompt: string,
  width = 1024,
  height = 1024
): Promise<ImageResult> => {
  assertConfigured();
  const res = await fetch(`${JAGX_AI_BASE_URL}/image`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prompt, width, height }),
  });
  return parseOrThrow(res);
};

/** Convenience: turns an ImageResult into a ready-to-use <img src> data URL */
export const imageResultToDataUrl = (result: ImageResult): string =>
  `data:image/${result.format};base64,${result.image_base64}`;

// ---- Video generation (async: start, then poll) ----
export interface VideoStartResult {
  success: boolean;
  video_id: string;
  status: string;
  message: string;
}

export interface VideoStatusResult {
  success: boolean;
  video_id: string;
  status: 'processing' | 'completed' | string;
  video_url?: string;
}

export const jagxGenerateVideo = async (
  prompt: string,
  width = 1152,
  height = 768,
  numFrames = 121
): Promise<VideoStartResult> => {
  assertConfigured();
  const res = await fetch(`${JAGX_AI_BASE_URL}/video`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prompt, width, height, num_frames: numFrames }),
  });
  return parseOrThrow(res);
};

export const jagxVideoStatus = async (videoId: string): Promise<VideoStatusResult> => {
  assertConfigured();
  const res = await fetch(
    `${JAGX_AI_BASE_URL}/video-status?video_id=${encodeURIComponent(videoId)}`,
    { headers: authHeaders() }
  );
  return parseOrThrow(res);
};

/** Polls /video-status until completed or timeout. */
export const jagxWaitForVideo = async (
  videoId: string,
  { intervalMs = 4000, timeoutMs = 180000 }: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<VideoStatusResult> => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await jagxVideoStatus(videoId);
    if (status.status === 'completed') return status;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`JagX video ${videoId} did not complete within ${timeoutMs}ms`);
};

// ---- Speech to text ----
export interface SpeechToTextResult {
  success: boolean;
  text: string;
}

export const jagxSpeechToText = async (audioBlob: Blob, filename = 'audio.webm'): Promise<SpeechToTextResult> => {
  assertConfigured();
  const form = new FormData();
  form.append('file', audioBlob, filename);
  const res = await fetch(`${JAGX_AI_BASE_URL}/speech-to-text`, {
    method: 'POST',
    headers: authHeaders(), // no Content-Type: browser sets multipart boundary
    body: form,
  });
  return parseOrThrow(res);
};

// ---- Text to speech ----
export interface TextToSpeechResult {
  success: boolean;
  audio_base64: string;
  format: string;
}

export const jagxTextToSpeech = async (text: string): Promise<TextToSpeechResult> => {
  assertConfigured();
  if (text.length > 1000) {
    throw new Error('JagX text-to-speech supports a maximum of 1000 characters.');
  }
  const res = await fetch(`${JAGX_AI_BASE_URL}/text-to-speech`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ text }),
  });
  return parseOrThrow(res);
};

/** Convenience: play a TTS result immediately */
export const playTextToSpeech = async (text: string): Promise<HTMLAudioElement> => {
  const result = await jagxTextToSpeech(text);
  const audio = new Audio(`data:audio/${result.format};base64,${result.audio_base64}`);
  await audio.play();
  return audio;
};

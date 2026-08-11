//const AI_API_BASE_URL = 'http://127.0.0.1:8001';
const AI_API_BASE_URL = 'http://10.0.2.2:8001';

export interface VehicleDraft {
    make?: string | null;
    model?: string | null;
    year?: number | null;
    askPrice?: number | null;
    ask_price?: number | null;
    status?: string | null;
    vin?: string | null;
    color?: string | null;
    trim?: string | null;
    mileage?: number | null;
    interiorColor?: string | null;
    interior_color?: string | null;
    bodyType?: string | null;
    body_type?: string | null;
    engineInfo?: string | null;
    engine_info?: string | null;
    fuelType?: string | null;
    transmission?: string | null;
    drivetrain?: string | null;
    description?: string | null;
}

export interface SearchVehicleResult {
    id: number;
    year?: number;
    make?: string;
    model?: string;
    askPrice?: number;
    mileage?: number;
    status?: string;
    primaryImage?: {
        url?: string;
    } | null;
}

export interface AIResponse {
  conversation_id: string;
  status: string;
  message: string;

  transcript?: string;

  missing_fields?: string[];
  vehicle_draft?: VehicleDraft;

  filters?: Record<string, unknown>;
  results?: SearchVehicleResult[];
  total?: number;
  page?: number;
  page_size?: number;

  audio_base64?: string | null;
  audio_content_type?: string | null;
}

async function parseResponse(
    response: Response
): Promise<AIResponse> {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            data?.error?.message ||
            data?.detail ||
            data?.message ||
            `AI request failed with status ${response.status}.`;

        throw new Error(message);
    }

    return data;
}

async function sendTextRequest(
    endpoint: string,
    text: string,
    conversationId: string
): Promise<AIResponse> {
    const formData = new FormData();

    formData.append('text', text);
    formData.append('conversation_id', conversationId);

    const response = await fetch(
        `${AI_API_BASE_URL}${endpoint}`,
        {
            method: 'POST',
            body: formData,
        }
    );

    return parseResponse(response);
}

async function sendAudioRequest(
  endpoint: string,
  audioUri: string,
  conversationId: string,
  speak = true
): Promise<AIResponse> {
  const formData = new FormData();

  formData.append(
    'conversation_id',
    conversationId
  );

  formData.append(
    'speak',
    String(speak)
  );

  // Web
  if (audioUri.startsWith('blob:')) {
    const audioResponse =
      await fetch(audioUri);

    const audioBlob =
      await audioResponse.blob();

    formData.append(
      'audio',
      audioBlob,
      'vehicle-command.webm'
    );
  } else {
    // Android / iOS
    formData.append(
      'audio',
      {
        uri: audioUri,
        name: 'vehicle-command.m4a',
        type: 'audio/m4a',
      } as any
    );
  }

  const response = await fetch(
    `${AI_API_BASE_URL}${endpoint}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  return parseResponse(response);
}
export function sendVehicleCreateText(
    text: string,
    conversationId: string
): Promise<AIResponse> {
    return sendTextRequest(
        '/api/v1/agent/voice/create',
        text,
        conversationId
    );
}

export function sendVehicleSearchText(
    text: string,
    conversationId: string
): Promise<AIResponse> {
    return sendTextRequest(
        '/api/v1/agent/voice/search',
        text,
        conversationId
    );
}

export function sendVehicleCreateAudio(
  audioUri: string,
  conversationId: string,
  speak = true
): Promise<AIResponse> {
  return sendAudioRequest(
    '/api/v1/agent/voice/create',
    audioUri,
    conversationId,
    speak
  );
}

export function sendVehicleSearchAudio(
  audioUri: string,
  conversationId: string,
  speak = true
): Promise<AIResponse> {
  return sendAudioRequest(
    '/api/v1/agent/voice/search',
    audioUri,
    conversationId,
    speak
  );
}

export async function sendVehicleCreateChat(
  message: string,
  conversationId: string
): Promise<AIResponse> {
  const response = await fetch(
    `${AI_API_BASE_URL}/api/v1/agent/chat/create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        message,
      }),
    }
  );

  return parseResponse(response);
}

export async function sendVehicleSearchChat(
  message: string,
  conversationId: string
): Promise<AIResponse> {
  const response = await fetch(
    `${AI_API_BASE_URL}/api/v1/agent/chat/search`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        message,
      }),
    }
  );

  return parseResponse(response);
}
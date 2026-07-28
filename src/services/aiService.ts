const AI_API_BASE_URL = "http://127.0.0.1:8001";

export interface VehicleDraft {
    make?: string | null;
    model?: string | null;
    year?: number | null;
    askPrice?: number | null;
    status?: string | null;
    vin?: string | null;
    color?: string | null;
}

export interface AICreateVehicleResponse {
    conversation_id: string;
    status: 'needs_info' | 'ready_to_confirm' | 'completed' | string;
    message: string;
    missing_fields?: string[];
    vehicle_draft?: VehicleDraft;
}

export const sendVehicleCreateText = async (
    text: string,
    conversationId: string
): Promise<AICreateVehicleResponse> => {
    const formData = new FormData();

    formData.append('text', text);
    formData.append('conversation_id', conversationId);

    const response = await fetch(
        `${AI_API_BASE_URL}/api/v1/agent/voice/create`,
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'AI request failed.');
    }

    return response.json();
};
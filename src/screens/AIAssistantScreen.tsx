import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';

import {
    sendVehicleCreateText,
    VehicleDraft,
} from '../services/aiService';

export default function AIAssistantScreen() {
    const [conversationId] = useState('550e8400-e29b-41d4-a716-446655440001');
    const [inputText, setInputText] = useState('');
    const [aiMessage, setAiMessage] = useState(
        'Tell me about the vehicle you want to create.'
    );
    const [vehicleDraft, setVehicleDraft] =
        useState<VehicleDraft | null>(null);
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSend = async () => {
        const trimmedText = inputText.trim();

        if (!trimmedText || loading) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            const result = await sendVehicleCreateText(
                trimmedText,
                conversationId
            );

            console.log('AI result:', result);
            console.log(
                'Vehicle draft returned by backend:',
                JSON.stringify(result.vehicle_draft, null, 2)
            );

            setAiMessage(result.message);
            setVehicleDraft(result.vehicle_draft ?? null);
            setMissingFields(result.missing_fields ?? []);
            setStatus(result.status);
            setInputText('');
        } catch (err) {
            console.error('AI request failed:', err);

            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to communicate with AI.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>AI Vehicle Assistant</Text>

            <View style={styles.messageBox}>
                <Text style={styles.label}>AI Assistant</Text>
                <Text style={styles.message}>{aiMessage}</Text>
            </View>

            {status ? (
                <Text style={styles.status}>Status: {status}</Text>
            ) : null}

            {missingFields.length > 0 ? (
                <Text style={styles.missing}>
                    Missing: {missingFields.join(', ')}
                </Text>
            ) : null}

            {vehicleDraft ? (
                <View style={styles.draftBox}>
                    <Text style={styles.label}>Vehicle Draft</Text>

                    <Text>Make: {vehicleDraft.make ?? '-'}</Text>
                    <Text>Model: {vehicleDraft.model ?? '-'}</Text>
                    <Text>Year: {vehicleDraft.year ?? '-'}</Text>
                    <Text>
                        Ask Price: {vehicleDraft.askPrice?? '-'}
                    </Text>
                    <Text>Status: {vehicleDraft.status ?? '-'}</Text>
                </View>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Example: I have a 2022 Honda Civic"
                value={inputText}
                onChangeText={setInputText}
                editable={!loading}
                multiline
            />

            <Pressable
                style={[
                    styles.button,
                    (!inputText.trim() || loading) &&
                        styles.buttonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || loading}
            >
                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <Text style={styles.buttonText}>Send</Text>
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    messageBox: {
        padding: 16,
        borderRadius: 10,
        backgroundColor: '#f2f2f2',
        marginBottom: 12,
    },
    draftBox: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 12,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
    },
    status: {
        marginBottom: 8,
        fontWeight: '600',
    },
    missing: {
        marginBottom: 12,
    },
    input: {
        minHeight: 90,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        textAlignVertical: 'top',
        marginBottom: 12,
    },
    button: {
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#1f6feb',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    error: {
        color: 'red',
        marginBottom: 12,
    },
});
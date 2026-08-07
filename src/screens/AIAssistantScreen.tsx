import React, { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
    useAudioRecorder,
    RecordingPresets,
} from 'expo-audio';


import {
    AIResponse,
    sendVehicleCreateText,
    sendVehicleSearchText,
    sendVehicleCreateAudio,
    sendVehicleSearchAudio,
    sendVehicleCreateChat,
    sendVehicleSearchChat
} from '../services/aiService';

type AssistantMode = 'create' | 'search' | null;

type ChatMessage = {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
};

const CREATE_CONVERSATION_ID =
    '550e8400-e29b-41d4-a716-446655440011';

const SEARCH_CONVERSATION_ID =
    '550e8400-e29b-41d4-a716-446655440012';



export default function AIAssistantScreen({ navigation }: any) {
    const [mode, setMode] = useState<AssistantMode>(null);
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [latestResult, setLatestResult] =
        useState<AIResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const recorder = useAudioRecorder(
        RecordingPresets.HIGH_QUALITY
    );

    const [isRecording, setIsRecording] = useState(false);
    const selectMode = (selectedMode: AssistantMode) => {
        setMode(selectedMode);
        setMessages([]);
        setLatestResult(null);
        setInputText('');
        setError('');


        if (selectedMode === 'create') {
            setMessages([
                {
                    id: 'welcome-create',
                    sender: 'assistant',
                    text: 'Tell me about the vehicle you want to create.',
                },
            ]);
        }

        if (selectedMode === 'search') {
            setMessages([
                {
                    id: 'welcome-search',
                    sender: 'assistant',
                    text: 'What kind of vehicle are you looking for?',
                },
            ]);
        }
    };

    const handleSend = async () => {
        const text = inputText.trim();

        if (!text || !mode || loading) {
            return;
        }

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text,
        };

        setMessages(previous => [
            ...previous,
            userMessage,
        ]);

        setInputText('');
        setLoading(true);
        setError('');

        try {
            const result =
                mode === 'create'
                    ? await sendVehicleCreateChat(
                          text,
                          CREATE_CONVERSATION_ID
                      )
                    : await sendVehicleSearchChat(
                          text,
                          SEARCH_CONVERSATION_ID
                      );

console.log('RAW AI RESULT:', result);
console.log('AI MESSAGE:', result.message);
console.log('MISSING FIELDS:', result.missing_fields);
console.log('VEHICLE DRAFT:', result.vehicle_draft);

            setLatestResult(result);

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                sender: 'assistant',
                text:
                    result.message ||
                    'Your request was processed.',
            };

            setMessages(previous => [
                ...previous,
                assistantMessage,
            ]);
        } catch (err) {
            setLatestResult(null);

            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to communicate with AI.';

            setError(message);
        } finally {
            setLoading(false);
        }
    };

const handleVoice = async () => {
    try {
        if (!isRecording) {
            const permission =
                await requestRecordingPermissionsAsync();

            if (!permission.granted) {
                setError('Microphone permission is required.');
                return;
            }

            await setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true,
            });

            await recorder.prepareToRecordAsync();
            recorder.record();

            setIsRecording(true);
            setError('');
            return;
        }

        await recorder.stop();
        setIsRecording(false);

        const audioUri = recorder.uri;

        if (!audioUri || !mode) {
            setError('No audio recording was created.');
            return;
        }

        setLoading(true);
        setError('');

        const result =
            mode === 'create'
                ? await sendVehicleCreateAudio(
                      audioUri,
                      CREATE_CONVERSATION_ID
                  )
                : await sendVehicleSearchAudio(
                      audioUri,
                      SEARCH_CONVERSATION_ID
                  );

        console.log('Voice AI result:', result);

        setLatestResult(result);

        const userVoiceMessage: ChatMessage = {
            id: `voice-user-${Date.now()}`,
            sender: 'user',
            text:
                result.transcript?.trim() ||
                '🎤 Voice message',
        };

        const assistantMessage: ChatMessage = {
            id: `voice-assistant-${Date.now()}`,
            sender: 'assistant',
            text:
                result.message ||
                'Your voice request was processed.',
        };

        setMessages(previous => [
            ...previous,
            userVoiceMessage,
            assistantMessage,
        ]);
    } catch (err) {
        console.error('Voice request failed:', err);

        setIsRecording(false);
        setLatestResult(null);

        setError(
            err instanceof Error
                ? err.message
                : 'Voice request failed.'
        );
    } finally {
        setLoading(false);
    }
};

    if (!mode) {
        return (
            <View style={styles.container}>
                <View style={styles.welcomeHeader}>
                    <View style={styles.robotAvatar}>
                        <MaterialCommunityIcons
                            name="robot-happy-outline"
                            size={34}
                            color="#1f6feb"
                        />
                    </View>

                    <Text style={styles.mainTitle}>
                        CarAxios AI Assistant
                    </Text>

                    <Text style={styles.subtitle}>
                        How can I help with your inventory today?
                    </Text>
                </View>

                <Pressable
                    style={styles.optionCard}
                    onPress={() => selectMode('create')}
                >
                    <View style={styles.optionIconBox}>
                        <Text style={styles.optionIcon}>🚗</Text>
                    </View>

                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>
                            Create Vehicle
                        </Text>

                        <Text style={styles.optionDescription}>
                            Create a listing using natural language or voice.
                        </Text>
                    </View>

                    <Text style={styles.arrow}>›</Text>
                </Pressable>

                <Pressable
                    style={styles.optionCard}
                    onPress={() => selectMode('search')}
                >
                    <View style={styles.optionIconBox}>
                        <Text style={styles.optionIcon}>🔍</Text>
                    </View>

                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>
                            Search Inventory
                        </Text>

                        <Text style={styles.optionDescription}>
                            Find vehicles using a natural-language request.
                        </Text>
                    </View>

                    <Text style={styles.arrow}>›</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Pressable
                    style={styles.changeModeButton}
                    onPress={() => selectMode(null)}
                >
                    <Text style={styles.changeModeText}>
                        ← Back
                    </Text>
                </Pressable>

                <View style={styles.modeBadge}>
                    <Text style={styles.modeBadgeText}>
                        {mode === 'create'
                            ? 'Create Vehicle'
                            : 'Search Inventory'}
                    </Text>
                </View>
            </View>

            <View style={styles.moduleHeader}>
                <View style={styles.robotAvatarSmall}>
                    <MaterialCommunityIcons
                        name="robot-happy-outline"
                        size={28}
                        color="#1f6feb"
                    />
                </View>

                <Text style={styles.moduleTitle}>
                    CarAxios AI Assistant
                </Text>

                <Text style={styles.moduleSubtitle}>
                    {mode === 'create'
                        ? 'Describe the vehicle and I will prepare a draft.'
                        : 'Tell me what kind of vehicle you are looking for.'}
                </Text>
            </View>

            <ScrollView
                style={styles.chatArea}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map(message => (
                    <View
                        key={message.id}
                        style={[
                            styles.messageRow,
                            message.sender === 'user'
                                ? styles.userMessageRow
                                : styles.assistantMessageRow,
                        ]}
                    >
                        {message.sender === 'assistant' ? (
                            <View style={styles.avatar}>
                                    <MaterialCommunityIcons
                                name="robot-happy-outline"
                                size={18}
                                color="#f2f4f7"
                            />
                            </View>
                        ) : null}

                        <View
                            style={[
                                styles.messageBubble,
                                message.sender === 'user'
                                    ? styles.userBubble
                                    : styles.assistantBubble,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.messageText,
                                    message.sender === 'user'
                                        ? styles.userMessageText
                                        : null,
                                ]}
                            >
                                {message.text}
                            </Text>
                        </View>
                    </View>
                ))}

                {loading ? (
                    <View style={styles.assistantMessageRow}>
                    <View style={styles.chatAvatar}>
                        <MaterialCommunityIcons
                            name="robot-happy-outline"
                            size={18}
                            color="#1f6feb"
                        />
                    </View>

                        <View
                            style={[
                                styles.messageBubble,
                                styles.assistantBubble,
                                styles.loadingBubble,
                            ]}
                        >
                            <ActivityIndicator size="small" />
                            <Text style={styles.processingText}>
                                Processing...
                            </Text>
                        </View>
                    </View>
                ) : null}

                {latestResult?.vehicle_draft ? (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultCardTitle}>
                            Vehicle Draft
                        </Text>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>
                                Year
                            </Text>
                            <Text style={styles.resultValue}>
                                {latestResult.vehicle_draft.year ?? '-'}
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>
                                Make
                            </Text>
                            <Text style={styles.resultValue}>
                                {latestResult.vehicle_draft.make ?? '-'}
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>
                                Model
                            </Text>
                            <Text style={styles.resultValue}>
                                {latestResult.vehicle_draft.model ?? '-'}
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>
                                Ask Price
                            </Text>
                            <Text style={styles.resultValue}>
                                {latestResult.vehicle_draft.askPrice ??
                                    latestResult.vehicle_draft.ask_price ??
                                    '-'}
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>
                                Status
                            </Text>
                            <Text style={styles.resultValue}>
                                {latestResult.vehicle_draft.status ?? '-'}
                            </Text>
                        </View>

                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>
                                {latestResult.status}
                            </Text>
                        </View>
                    </View>
                ) : null}

                {latestResult?.status === 'ready_to_confirm' &&
                latestResult.vehicle_draft ? (
                    <Pressable
                        style={styles.primaryActionButton}
                        onPress={() =>
                            navigation.navigate('CreateVehicle', {
                                aiDraft: latestResult.vehicle_draft,
                            })
                        }
                    >
                        <Text style={styles.primaryActionText}>
                            Review & Edit Vehicle
                        </Text>
                    </Pressable>
                ) : null}

                {latestResult?.results?.map(vehicle => (
                    <View
                        key={vehicle.id}
                        style={styles.vehicleCard}
                    >
                        <Text style={styles.vehicleTitle}>
                            {vehicle.year} {vehicle.make}{' '}
                            {vehicle.model}
                        </Text>

                        <Text style={styles.vehiclePrice}>
                            $
                            {Number(
                                vehicle.askPrice ?? 0
                            ).toLocaleString()}
                        </Text>

                        <Text style={styles.vehicleMeta}>
                            {vehicle.status ?? 'Unknown status'}
                        </Text>
                    </View>
                ))}

                {mode === 'search' &&
                latestResult?.results &&
                latestResult.results.length > 0 ? (
                    <Pressable
                        style={styles.primaryActionButton}
                        onPress={() =>
                            navigation.navigate('Inventory', {
                                aiVehicles: latestResult.results,
                            })
                        }
                    >
                        <Text style={styles.primaryActionText}>
                            View Results
                        </Text>
                    </Pressable>
                ) : null}

                {error ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>
                            {error}
                        </Text>
                    </View>
                ) : null}
            </ScrollView>

            <View style={styles.inputBar}>
            <Pressable
                style={[
                    styles.micButton,
                    isRecording && styles.micButtonRecording,
                ]}
                onPress={handleVoice}
                disabled={loading}
            >
                <Text style={styles.micIcon}>
                    {isRecording ? '■' : '🎤'}
                </Text>
            </Pressable>

                <TextInput
                    style={styles.chatInput}
                    placeholder={
                        mode === 'create'
                            ? 'Describe the vehicle...'
                            : 'Describe what you are looking for...'
                    }
                    placeholderTextColor="#888"
                    value={inputText}
                    onChangeText={setInputText}
                    editable={!loading}
                    onSubmitEditing={handleSend}
                />

                <Pressable
                    style={[
                        styles.sendIconButton,
                        (!inputText.trim() || loading) &&
                            styles.disabledButton,
                    ]}
                    onPress={handleSend}
                    disabled={!inputText.trim() || loading}
                >
                    <Text style={styles.sendIconText}>➤</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f6f8fb',
    },

welcomeHeader: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 30,
},
robotAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#e7f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
},
mainTitle: {
    width: '100%',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#172033',
    textAlign: 'center',
    marginBottom: 6,
},

subtitle: {
    width: '100%',
    fontSize: 16,
    color: '#697386',
    textAlign: 'center',
},

    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e4e8ef',
    },

    optionIconBox: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#edf4ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },

    optionIcon: {
        fontSize: 26,
    },

    optionContent: {
        flex: 1,
    },

    optionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#172033',
        marginBottom: 4,
    },

    optionDescription: {
        fontSize: 14,
        color: '#697386',
        lineHeight: 20,
    },

    arrow: {
        fontSize: 30,
        color: '#8c96a8',
    },

    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    changeModeButton: {
        paddingVertical: 8,
        paddingRight: 12,
    },

    changeModeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1f6feb',
    },

    modeBadge: {
        backgroundColor: '#e8f1ff',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },

    modeBadgeText: {
        color: '#1f6feb',
        fontWeight: '600',
        fontSize: 13,
    },

    modeSubtitle: {
        fontSize: 15,
        color: '#697386',
        marginBottom: 14,
    },

    chatArea: {
        flex: 1,
    },

    chatContent: {
        paddingVertical: 10,
        paddingBottom: 24,
    },

    messageRow: {
        flexDirection: 'row',
        marginBottom: 14,
        alignItems: 'flex-end',
    },

    assistantMessageRow: {
        justifyContent: 'flex-start',
    },

    userMessageRow: {
        justifyContent: 'flex-end',
    },

    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#1f6feb',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },

    avatarText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },

    messageBubble: {
        maxWidth: '78%',
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 18,
    },

    assistantBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 5,
        borderWidth: 1,
        borderColor: '#e3e7ee',
    },

    userBubble: {
        backgroundColor: '#1f6feb',
        borderBottomRightRadius: 5,
    },

    messageText: {
        fontSize: 16,
        lineHeight: 22,
        color: '#172033',
    },

    userMessageText: {
        color: '#fff',
    },

    loadingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    processingText: {
        marginLeft: 8,
        color: '#697386',
    },

    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#dfe5ed',
    },

    resultCardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#172033',
        marginBottom: 12,
    },

    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },

    resultLabel: {
        color: '#697386',
        fontSize: 15,
    },

    resultValue: {
        color: '#172033',
        fontSize: 15,
        fontWeight: '600',
    },

    statusBadge: {
        alignSelf: 'flex-start',
        marginTop: 12,
        backgroundColor: '#e9f8ef',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },

    statusBadgeText: {
        color: '#237a45',
        fontWeight: '600',
        fontSize: 13,
    },

    vehicleCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#dfe5ed',
    },

    vehicleTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#172033',
        marginBottom: 6,
    },

    vehiclePrice: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1f6feb',
        marginBottom: 4,
    },

    vehicleMeta: {
        color: '#697386',
        textTransform: 'capitalize',
    },

    primaryActionButton: {
        backgroundColor: '#1f6feb',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 18,
    },

    primaryActionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    errorBox: {
        backgroundColor: '#fff0f0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 14,
    },

    errorText: {
        color: '#b42318',
        fontSize: 14,
    },

    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 28,
        paddingHorizontal: 8,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: '#dfe5ed',
    },

    micButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },

    micIcon: {
        fontSize: 23,
    },

    chatInput: {
        flex: 1,
        fontSize: 16,
        color: '#172033',
        paddingHorizontal: 8,
        paddingVertical: 10,
    },

    sendIconButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#1f6feb',
        alignItems: 'center',
        justifyContent: 'center',
    },

    sendIconText: {
        color: '#fff',
        fontSize: 19,
        fontWeight: 'bold',
    },

    disabledButton: {
        opacity: 0.45,
    },
    moduleHeader: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
},

robotAvatarSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e7f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
},

moduleTitle: {
    width: '100%',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#172033',
    textAlign: 'center',
    marginBottom: 4,
},

moduleSubtitle: {
    width: '100%',
    fontSize: 15,
    color: '#697386',
    textAlign: 'center',
},
chatAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e7f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
},
micButtonRecording: {
    backgroundColor: '#ffe7e7',
},
});
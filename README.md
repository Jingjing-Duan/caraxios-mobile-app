# CarAxios Mobile App

## Overview

CarAxios is a cross-platform mobile application built with React Native and Expo for vehicle inventory management.

The application allows dealership staff to manage inventory, decode VINs, upload multiple vehicle images, and interact with an AI Assistant to create and search vehicle listings using text or voice.

---

# Technology Stack

- React Native
- Expo
- TypeScript
- React Navigation
- Expo Image Picker
- Expo Audio
- REST APIs

---

# Features

- Dashboard
- Inventory List
- Vehicle Details
- Create Vehicle
- Edit Vehicle
- Delete Vehicle
- VIN Decoding
- Multiple Image Upload
- Image Reordering
- AI Assistant
  - Create Vehicle
  - Search Inventory
  - Voice Recording

---

# Environment Variables

The frontend requires the following environment variables.

```env
EXPO_PUBLIC_BACKEND_BASE_URL=
EXPO_PUBLIC_AI_API_BASE_URL=
```

Example (local development):

```env
EXPO_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
EXPO_PUBLIC_AI_API_BASE_URL=http://localhost:8001
```

**Do not commit API keys or secrets to the repository.**

---

# Installation

Install dependencies:

```bash
npm install
```

Install Expo packages:

```bash
npx expo install
```

Check package compatibility:

```bash
npx expo install --check
npx expo-doctor
```

---

# Run the Project

Start Expo:

```bash
npx expo start
```

Run Web:

```bash
npx expo start --web
```

Default Expo Web address:

```text
http://localhost:8081
```

---

# Backend Dependencies

## Vehicle Backend

Default local address:

```text
http://localhost:8000
```

Provides:

- Vehicle CRUD
- VIN Decoding
- Vehicle Images
- Inventory Search

---

## AI Backend

Default local address:

```text
http://localhost:8001
```

Main endpoints:

```http
POST /api/v1/agent/chat/create
POST /api/v1/agent/chat/search
```

These endpoints accept multipart/form-data requests containing either text or audio.

---

# Example API Requests

## AI Create

Request

```http
POST /api/v1/agent/chat/create
```

Form Data

```text
text=I have a 2022 Honda Civic
conversation_id=550e8400-e29b-41d4-a716-446655440011
```

Example Response

```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440011",
  "status": "needs_info",
  "message": "What price would you like to ask for it?",
  "missing_fields": [
    "ask_price"
  ],
  "vehicle_draft": {
    "year": 2022,
    "make": "Honda",
    "model": "Civic",
    "status": "available"
  }
}
```

---

## AI Search

Request

```http
POST /api/v1/agent/chat/search
```

Form Data

```text
text=Show me available Honda vehicles
conversation_id=550e8400-e29b-41d4-a716-446655440012
```

Example Response

```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440012",
  "status": "results",
  "message": "Found 1 vehicle matching your search.",
  "results": [
    {
      "id": 1003,
      "year": 2022,
      "make": "Honda",
      "model": "Civic",
      "askPrice": 24995,
      "status": "available"
    }
  ]
}
```

---

# Project Structure

```text
src
│
├── components
│   └── VehicleCard.tsx
│
├── screens
│   ├── DashboardScreen.tsx
│   ├── InventoryListScreen.tsx
│   ├── VehicleDetailScreen.tsx
│   ├── CreateVehicleScreen.tsx
│   ├── EditVehicleScreen.tsx
│   └── AIAssistantScreen.tsx
│
└── services
    ├── vehicleService.ts
    └── aiService.ts
```

---

# Known Limitations

### Voice Recording

- Expo Web records audio as **audio/webm**.
- Gemini currently does not support **audio/webm**.
- Audio should be converted by the AI Backend before sending to Gemini.

### Mobile Testing

Physical mobile devices cannot access backend services using:

```text
localhost
127.0.0.1
```

Use the development computer's local IP address instead.

Example:

```text
http://192.168.x.x:8000
http://192.168.x.x:8001
```

The backend services must listen on:

```text
0.0.0.0
```

---

# Current Status

Completed

- Core application screens
- Vehicle CRUD integration
- VIN decoding
- Multiple image upload
- AI Assistant (Create & Search)
- Voice recording UI
- AI draft review
- Inventory search integration

In Progress

- AI voice integration
- End-to-end testing
- Bug fixing
- Client demo preparation
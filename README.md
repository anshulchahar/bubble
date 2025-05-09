# Bubble Task Manager

A visual task management app built with React Native and Expo. Tasks are represented as colorful bubbles that can be dragged around and organized spatially.

## Features

- Create, update, and manage tasks
- Tasks represented as bubbles with size based on priority and importance
- Drag-and-drop interface for organizing tasks
- Color-coded bubbles based on task status
- Optional cloud sync with Supabase (requires login)
- Works offline with local storage

## Recent Enhancements

### Draggable Task Bubbles
- Bubbles can now be dragged around the canvas for spatial organization
- Visual feedback when dragging (bubble size increases)
- Enhanced shadows for better visual hierarchy
- Reset button to rearrange bubbles

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- iOS Simulator or Android Emulator (optional)

### Installation

```bash
# Install dependencies
npm install

# Start the app
npm start
```

### Using the App

1. **Without Signing In**:
   - All data is stored locally on your device
   - Create tasks and organize them
   - Full functionality available offline

2. **With Signing In**:
   - Data syncs across devices
   - Secure cloud storage with Supabase

### Dragging Bubbles

- Touch and hold a bubble to start dragging
- Move your finger to reposition the bubble
- Release to drop the bubble in place
- Use the reset button (bottom left) to rearrange all bubbles if needed

## Tech Stack

- React Native
- Expo
- Zustand (State Management)
- Supabase (Backend)
- AsyncStorage (Local Storage)
- React Navigation

## License

MIT 
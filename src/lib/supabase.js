import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill';

// Supabase credentials
const supabaseUrl = 'https://dsseogckfyanxqrqzupu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzc2VvZ2NrZnlhbnhxcnF6dXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0Mzg1MDcsImV4cCI6MjA2MjAxNDUwN30.jP_GR2RqBrYZxmhYBdk3rEVLEl9jM4zb8T9fuxRAZ_o';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    // Use fetch directly to avoid Node.js module dependencies
    fetch: fetch.bind(globalThis),
  },
  // Disable realtime features to avoid WebSocket dependencies
  realtime: {
    params: {
      eventsPerSecond: 0,
    },
  },
});

// Google Auth credentials
export const GOOGLE_CLIENT_ID = '907178571574-c7po4neoudf0bgra4d2ppoobocsf2eh8.apps.googleusercontent.com';

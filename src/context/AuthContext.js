import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { supabase, GOOGLE_CLIENT_ID } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

// Initialize the auth redirect
WebBrowser.maybeCompleteAuthSession();

// Create context
const AuthContext = createContext(null);

// Auth Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Standard email/password sign in
  const signInWithEmail = async (email, name) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { name },
          emailRedirectTo: AuthSession.makeRedirectUri({ path: 'auth/callback' }),
        },
      });

      if (error) throw error;
      Alert.alert('Check your email', 'We sent you a login link!');
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Google authentication
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // For Expo development, include the exact host you're working with
      const redirectUri = AuthSession.makeRedirectUri({ 
        path: 'auth/callback',
        // For development in Expo Go
        useProxy: false
      });
      
      // This will log something like exp://192.168.0.100:8081/--/auth/callback
      console.log('Redirect URI for Google auth:', redirectUri);
      
      const nonce = Crypto.randomUUID();
      
      // For debugging - log relevant information
      console.log('Using provider: google');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
        },
      });
      
      if (error) {
        console.error('OAuth request error:', JSON.stringify(error, null, 2));
        throw error;
      }

      if (!data?.url) {
        throw new Error('No authorization URL returned');
      }

      console.log('Opening auth URL...');
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      console.log('Auth result type:', result.type);
      
      if (result.type === 'success') {
        const { url } = result;
        console.log('Auth successful, exchanging code for session');
        const { error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) {
          console.error('Session exchange error:', error);
          throw error;
        }
      } else {
        console.log('Auth was dismissed or failed:', result.type);
        if (result.type === 'cancel') {
          Alert.alert('Authentication Cancelled', 'You cancelled the authentication process');
        }
      }
    } catch (error) {
      Alert.alert('Sign In Error', error.message);
      console.error('Sign in error details:', JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Return context provider
  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
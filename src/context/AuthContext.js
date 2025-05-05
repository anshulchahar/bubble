import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, Platform } from 'react-native';
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

  // For debugging purposes - display the proxy URI without triggering the auth flow
  useEffect(() => {
    const debugProxyUri = AuthSession.makeRedirectUri({ 
      path: 'auth/callback',
      useProxy: true
    });
    console.log('Debug Proxy URI:', debugProxyUri);
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
      
      // For development in Expo Go - Dynamic IP address can cause issues with Google OAuth
      // Using a fixed endpoint that's registered with Google
      const proxyRedirectUri = 'https://auth.expo.io/@anshulchahar/bubble';
      
      // Log the URI for debugging
      console.log('Using fixed Redirect URI:', proxyRedirectUri);
      
      // Generate a proper PKCE code verifier
      const generateCodeVerifier = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        let result = '';
        const length = 96;
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };
      
      const codeVerifier = generateCodeVerifier();
      console.log('Generated code verifier with length:', codeVerifier.length);
      console.log('Code verifier first 10 chars:', codeVerifier.substring(0, 10) + '...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: proxyRedirectUri,
          skipBrowserRedirect: true,
          codeVerifier: codeVerifier,
          // Ensure the response type is set to 'code'
          queryParams: {
            response_type: 'code',
            access_type: 'offline',
            prompt: 'consent'
          }
        },
      });
      
      if (error) {
        console.error('OAuth request error:', JSON.stringify(error, null, 2));
        throw error;
      }

      if (!data?.url) {
        throw new Error('No authorization URL returned');
      }

      console.log('Opening auth URL...', data.url.substring(0, 50) + '...');
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        proxyRedirectUri,
        {
          showInRecents: true,
          createTask: true
        }
      );
      console.log('Auth result type:', result.type);
      
      if (result.type === 'success') {
        const { url } = result;
        console.log('Auth successful with URL:', url.substring(0, 50) + '...');
        
        // Try to extract code from URL query parameters first
        const sessionUrl = new URL(url);
        const code = sessionUrl.searchParams.get('code');
        
        if (code) {
          // Authorization code flow - proceed with code exchange
          console.log('Got authorization code, starting session exchange');
          
          // Exchange code for session using the same codeVerifier
          const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code, codeVerifier);
          
          if (sessionError) {
            console.error('Session exchange error:', JSON.stringify(sessionError, null, 2));
            throw sessionError;
          }
          
          console.log('Session exchange successful:', sessionData ? 'Session data received' : 'No session data');
        } else {
          // Check for token in URL fragment (#)
          console.log('No code found, checking for fragment with access token');
          const hashParams = url.split('#')[1];
          
          if (hashParams && hashParams.includes('access_token=')) {
            console.log('Found access token in URL fragment, using it directly');
            
            // Parse the access token and other parameters from the fragment
            const fragmentParams = hashParams.split('&').reduce((params, param) => {
              const [key, value] = param.split('=');
              params[key] = decodeURIComponent(value);
              return params;
            }, {});
            
            const { access_token, refresh_token, expires_in } = fragmentParams;
            
            if (access_token) {
              console.log('Setting session with access token');
              
              // Set the session manually with the token we received
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token,
                refresh_token: refresh_token || null,
              });
              
              if (sessionError) {
                console.error('Setting session error:', JSON.stringify(sessionError, null, 2));
                throw sessionError;
              }
              
              console.log('Session set successful:', sessionData ? 'Session data received' : 'No session data');
            } else {
              throw new Error('No access token found in the redirect URL');
            }
          } else {
            console.error('No code or access token found in the redirect URL');
            throw new Error('No authorization code or access token found in the redirect URL');
          }
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
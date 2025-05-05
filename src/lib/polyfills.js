// Basic polyfills for React Native
import { Buffer } from 'buffer';
import 'react-native-url-polyfill';

// Polyfill Buffer
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Polyfill process
if (typeof global.process === 'undefined') {
  global.process = {
    env: {},
    nextTick: (callback, ...args) => setTimeout(() => callback(...args), 0)
  };
}

// Basic empty implementations of Node.js modules
global.https = {};
global.http = {};
global.net = {};
global.tls = {};
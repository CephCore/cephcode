// OpenAI OAuth configuration for ChatGPT Pro/Plus browser login
import { isEnvTruthy } from '../utils/envUtils.js'

// OpenAI OAuth endpoints
export const OPENAI_OAUTH_CONFIG = {
  // OpenAI OAuth 2.0 endpoints
  AUTHORIZE_URL: 'https://auth.openai.com/oauth/authorize',
  TOKEN_URL: 'https://auth.openai.com/oauth/token',
  // Client ID - using a registered client for OpenAI OAuth
  CLIENT_ID: process.env.OPENAI_OAUTH_CLIENT_ID || 'app_EMoamEEZ73f0CkXaXp7hrann',
  // Redirect URI for local callback - uses dynamic port
  REDIRECT_URI: 'http://localhost:1455/auth/callback',
  MANUAL_REDIRECT_URI: 'https://platform.openai.com/oauth/callback',
  // Scopes - matching OpenAI OAuth flow
  SCOPES: ['openid', 'profile', 'email', 'offline_access'],
} as const

// PKCE code challenge method
export const CODE_CHALLENGE_METHOD = 'S256' as const

// Storage key for OpenAI OAuth tokens
export const OPENAI_TOKEN_STORAGE_KEY = 'openai_oauth_tokens'

import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin'

import { devError, devLog } from './devLog'
import { supabase } from './supabase'

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID

GoogleSignin.configure({
  webClientId: googleWebClientId,
  offlineAccess: false,
  scopes: ['openid', 'profile', 'email'],
})

export async function signInWithGoogleInApp() {
  if (!googleWebClientId) {
    throw new Error('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in mobile/.env')
  }

  try {
    devLog('google-auth', 'starting Google sign-in')
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
    devLog('google-auth', 'play services available')

    const response = await GoogleSignin.signIn()
    if (!isSuccessResponse(response)) {
      throw new Error('Google sign-in was cancelled.')
    }
    devLog('google-auth', 'google account selected')

    const idToken = response.data?.idToken
    if (!idToken) {
      throw new Error('No Google ID token returned. Check your Android SHA-1 setup.')
    }
    devLog('google-auth', 'received Google id token')

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    })

    if (error) {
      throw error
    }

    devLog('google-auth', 'supabase id-token sign-in succeeded', {
      userId: data?.user?.id,
      email: data?.user?.email,
    })

    return data
  } catch (error) {
    devError('google-auth', 'google sign-in failed', error)
    if (isErrorWithCode(error)) {
      if (error.code === 'DEVELOPER_ERROR') {
        throw new Error(
          'DEVELOPER_ERROR: Google OAuth config mismatch. Verify Android OAuth client uses package com.tasko.mobile and SHA-1 51:9C:C2:50:C4:48:1E:68:02:3C:DE:B3:D8:CB:C2:24:B8:18:7C:D6, ensure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is your Web client ID, then reinstall the latest development build.',
        )
      }
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Google sign-in was cancelled.')
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google sign-in is already in progress.')
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services are not available or outdated.')
      }
    }

    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('RNGoogleSignin') || message.includes('NativeModule')) {
      throw new Error('Native Google Sign-In needs an Android development build; Expo Go does not include this native module.')
    }

    throw error
  }
}
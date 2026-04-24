import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const DEFAULT_ANDROID_CHANNEL_ID = 'default'

let isNotificationHandlerConfigured = false

export const configureNotificationHandler = () => {
  if (isNotificationHandlerConfigured) {
    return
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true
    })
  })

  isNotificationHandlerConfigured = true
}

const setupAndroidChannel = async () => {
  if (Platform.OS !== 'android') {
    return
  }

  await Notifications.setNotificationChannelAsync(DEFAULT_ANDROID_CHANNEL_ID, {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1E6BD6'
  })
}

export const registerForPushNotificationsAsync = async () => {
  await setupAndroidChannel()

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true
      }
    })
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return null
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
  const pushToken = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)

  return pushToken.data
}

import { isDevice } from 'expo-device';
import {
  setNotificationChannelAsync,
  AndroidImportance,
  getPermissionsAsync,
  requestPermissionsAsync,
  getExpoPushTokenAsync,
} from 'expo-notifications';
import { Platform } from 'react-native';

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await setNotificationChannelAsync('default', {
      importance: AndroidImportance.MAX,
      lightColor: '#FF231F7C',
      name: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  if (isDevice) {
    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('it was failed to get push notification permission');
      return;
    }
    token = (await getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('push notification only could work on physical devices');
  }

  return token;
}

export { registerForPushNotificationsAsync };

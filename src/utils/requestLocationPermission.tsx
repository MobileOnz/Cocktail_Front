import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '위치 권한 요청',
          message: '이 앱은 위치 정보를 사용하기 위해 권한이 필요합니다.',
          buttonNeutral: '나중에',
          buttonNegative: '거부',
          buttonPositive: '허용',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert('위치 권한 거부됨', '설정에서 위치 권한을 허용해주세요.');
        return false;
      }
    } else {
      const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

      if (status === RESULTS.GRANTED) {
        return true;
      } else {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (result === RESULTS.GRANTED) {
          return true;
        } else if (result === RESULTS.BLOCKED) {
          Alert.alert('위치 권한이 차단됨', '설정에서 위치 권한을 허용해주세요.');
        }
        return false;
      }
    }
  } catch (err) {
    console.warn('위치 권한 요청 중 에러:', err);
    return false;
  }
};

export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    console.log('위치 권한 없음');
    return null;
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('위치 가져오기 실패:', error);
        resolve(null); // 크래시 방지를 위해 reject 대신 resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        forceRequestLocation: true,
        showLocationDialog: true,
      }
    );
  });
};
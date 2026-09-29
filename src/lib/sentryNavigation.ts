// React Navigation 계측을 App.tsx(Sentry.init)와 Navigation.tsx(NavigationContainer)
// 양쪽에서 참조한다. 순환 import 를 피하려고 별도 모듈로 뺐다.
import * as Sentry from '@sentry/react-native';

export const sentryNavigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

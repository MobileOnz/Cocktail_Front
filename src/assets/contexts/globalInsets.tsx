import { EdgeInsets } from 'react-native-safe-area-context';

let globalInsets: EdgeInsets = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

export const setGlobalInsets = (insets: EdgeInsets) => {
  globalInsets = insets;
};

export const getGlobalInsets = (): EdgeInsets => globalInsets;

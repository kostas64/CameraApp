import {useEffect, useState} from 'react';
import {AppState} from 'react-native';

export const useIsForeground = () => {
  const [isForeground, setIsForeground] = useState(true);

  useEffect(() => {
    const onChange = appState => {
      setIsForeground(appState === 'active');
    };

    const listener = AppState.addEventListener('change', onChange);

    return () => listener.remove();
  }, []);

  return isForeground;
};

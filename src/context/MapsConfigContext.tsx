import { createContext, useContext } from 'react';

interface MapsConfigContextValue {
  mapsApiKey: string;
  isConfigured: boolean;
}

export const MapsConfigContext = createContext<MapsConfigContextValue>({
  mapsApiKey: '',
  isConfigured: false,
});

export function useMapsConfig(): MapsConfigContextValue {
  return useContext(MapsConfigContext);
}

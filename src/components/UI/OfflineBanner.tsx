import React from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [offline, setOffline] = React.useState(!navigator.onLine);
  React.useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);
  if (!offline) return null;
  return (
    <div className="w-full bg-amber-500 text-white text-sm py-2 px-4 flex items-center justify-center gap-2 shadow-md z-50">
      <WifiOff className="w-4 h-4" />
      <span>Mode hors-ligne : vos actions seront synchronisées à la reconnexion</span>
    </div>
  );
};

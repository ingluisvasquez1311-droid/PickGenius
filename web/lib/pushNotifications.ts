// Push Notification Manager

export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const getNotificationPermission = () => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

export const sendLocalNotification = async (
  title: string,
  body: string,
  url?: string
) => {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  
  await registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: url || '/',
    actions: [
      {
        action: 'open',
        title: 'Ver Ahora',
      },
    ],
  });
};

// Send notification for Hot Pick
export const notifyHotPick = async (playerName: string, probability: number, propType: string) => {
  await sendLocalNotification(
    '🔥 Hot Pick Detectado!',
    `${playerName} tiene ${probability}% de probabilidad en ${propType}`,
    '/props'
  );
};

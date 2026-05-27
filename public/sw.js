// Service Worker for Browser Web Push Notifications
// Listening to background notifications even when the app is closed.

self.addEventListener('push', function(event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    console.log('Web Push received:', data);

    const title = data.title || 'Urban Harvest Cafe';
    const options = {
      body: data.body || 'Your order status has been updated!',
      icon: '/icons/icon-192x192.png', // Fallback icons
      badge: '/icons/icon-192x192.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      },
      tag: 'order-status-alert', // Prevents duplicate notifications
      requireInteraction: true // Native alert remains until user interacts
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Failed to process push notification:', error);
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked.');
  event.notification.close();

  // Focus or open new window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      const urlToOpen = event.notification.data.url || '/';
      
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

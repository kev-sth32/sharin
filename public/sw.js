// TripNaari Service Worker for Push Notifications and PWA behavior

self.addEventListener("push", function (event) {
  if (!event.data) {
    console.log("Push event received but no data payload found.");
    return;
  }

  try {
    const payload = event.data.json();
    const title = payload.title || "TripNaari Alert";
    const options = {
      body: payload.body || "Explore safe, women-only group tours and handcrafted trips!",
      icon: payload.icon || "/icon-192.png",
      badge: payload.badge || "/icon-192.png",
      image: payload.image || undefined,
      tag: payload.tag || "tripnaari-alert",
      renotify: payload.renotify !== undefined ? payload.renotify : true,
      requireInteraction: payload.requireInteraction || false,
      data: {
        url: payload.url || "/",
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Error displaying push notification:", err);
    
    // Text fallback if not JSON
    const textFallback = event.data.text();
    event.waitUntil(
      self.registration.showNotification("TripNaari Travel Alert", {
        body: textFallback,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: "/" },
      })
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // If a window is already open, navigate it or focus it
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      
      // If we have any client window, we can use it to navigate
      if (clientList.length > 0) {
        const client = clientList[0];
        if ("navigate" in client) {
          return client.navigate(targetUrl).then(c => c.focus());
        }
      }

      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Simple caching fallback to support offline display check (required for install criteria on some browsers)
self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(clients.claim());
});

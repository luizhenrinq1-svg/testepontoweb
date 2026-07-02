/**
 * Service Worker para PontoWeb - PWA e Firebase
 * Versão: Correção de PWA (Adicionado Fetch) (V10.1)
 */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCn89LRlH1lksZ811--jb2jlB2iZS5NH1s",
  authDomain: "pontoweb-dc8dd.firebaseapp.com",
  projectId: "pontoweb-dc8dd",
  storageBucket: "pontoweb-dc8dd.firebasestorage.app",
  messagingSenderId: "465750633035",
  appId: "1:465750633035:web:282efd14b807e2a3823bce"
};

// Inicializa o Firebase
try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  console.log('[sw.js] Firebase inicializado com sucesso.');

  // Lógica de Segundo Plano (Background)
  messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] Mensagem recebida em segundo plano:', payload);
    
    const title = payload.data?.title || "Nova Mensagem";
    const body = payload.data?.body || "";

    const notificationOptions = {
      body: body,
      icon: 'https://github.com/sistemas-luiz/PontoWeb/blob/main/Icone.png?raw=true',
      badge: 'https://github.com/sistemas-luiz/PontoWeb/blob/main/Logo.png?raw=true',
      vibrate: [500, 200, 500, 200, 500],
      requireInteraction: true,
      tag: 'ponto-notification',
      data: {
        url: 'https://sistemas-luiz.github.io/PontoWeb/' 
      }
    };

    return self.registration.showNotification(title, notificationOptions);
  });
} catch (e) {
  console.error('[sw.js] Erro ao inicializar o Firebase:', e);
}

// Lógica de Clique na Notificação
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || 'https://sistemas-luiz.github.io/PontoWeb/';

  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes("sistemas-luiz.github.io/PontoWeb") && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// === ATIVAÇÃO DO PWA ===
self.addEventListener('install', (event) => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// === FETCH EVENT (OBRIGATÓRIO PARA A INSTALAÇÃO DO PWA) ===
// Sem este evento, o Chrome não reconhece o app como instalável.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // Retorna resposta de fallback offline se a rede falhar, caso aplicável futuramente.
      return caches.match(event.request);
    })
  );
});

/**
 * Service Worker para PontoWeb - PWA e Firebase
 * Versão: Correção de Links e Alinhamento de Projeto (V10.0)
 */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuração do Firebase (Sincronizada com o projeto pontoweb-dc8dd)
const firebaseConfig = {
  apiKey: "AIzaSyCn89LRlH1lksZ811--jb2jlB2iZS5NH1s",
  authDomain: "pontoweb-dc8dd.firebaseapp.com",
  projectId: "pontoweb-dc8dd",
  storageBucket: "pontoweb-dc8dd.firebasestorage.app",
  messagingSenderId: "465750633035",
  appId: "1:465750633035:web:282efd14b807e2a3823bce"
};

// Inicializa o Firebase no contexto do Service Worker
try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  console.log('[sw.js] Firebase inicializado com sucesso.');

  // === LÓGICA DE SEGUNDO PLANO (BACKGROUND) ===
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
        url: 'https://sistemas-luiz.github.io/PontoWeb/' // URL oficial de produção
      }
    };

    return self.registration.showNotification(title, notificationOptions);
  });
} catch (e) {
  console.error('[sw.js] Erro ao inicializar o Firebase:', e);
}

// === LÓGICA DE CLIQUE NA NOTIFICAÇÃO ===
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Define o link de destino (utiliza a URL enviada ou o domínio oficial como recurso de salvaguarda)
  const urlToOpen = event.notification.data?.url || 'https://sistemas-luiz.github.io/PontoWeb/';

  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(windowClients => {
      // 1. Tenta localizar uma aba existente que já esteja no domínio oficial
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes("sistemas-luiz.github.io/PontoWeb") && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. Se nenhuma aba for encontrada, abre uma nova com o endereço correto
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// === ATIVAÇÃO IMEDIATA DO PWA ===
self.addEventListener('install', (event) => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

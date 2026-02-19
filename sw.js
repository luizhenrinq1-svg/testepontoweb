/**
 * Service Worker para PontoWeb - PWA e Firebase
 * Versão: Correção de Link (Abre o App correto ao clicar)
 */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuração do Firebase (ATUALIZADA)
const firebaseConfig = {
  apiKey: "AIzaSyCqq447JT58S_zQNKL0jz6eZTVKRK69TCE",
  authDomain: "pontoweb-54c7d.firebaseapp.com",
  projectId: "pontoweb-54c7d",
  storageBucket: "pontoweb-54c7d.firebasestorage.app",
  messagingSenderId: "287775717012",
  appId: "1:287775717012:web:342536a3403a47fdf3e681",
  measurementId: "G-SPSZRR73MX"
};

// Inicializa Firebase no Service Worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// === LÓGICA DE BACKGROUND ===
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Mensagem recebida:', payload);
  
  const title = payload.data?.title || "Nova Mensagem";
  const body = payload.data?.body || "";

  const notificationOptions = {
    body: body,
    icon: 'https://github.com/luizhenrinq1-svg/testepontoweb/blob/main/Icone.png?raw=true',
    badge: 'https://github.com/luizhenrinq1-svg/testepontoweb/blob/main/Logo.png?raw=true',
    vibrate: [500, 200, 500, 200, 500],
    requireInteraction: true,
    tag: 'ponto-notification',
    data: {
      url: 'https://luizhenrinq1-svg.github.io/testepontoweb/' // Link absoluto do App
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

// === LÓGICA DE CLIQUE NA NOTIFICAÇÃO (CORRIGIDA) ===
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Define a URL correta (usa o que veio na notificação ou o link fixo)
  const urlToOpen = event.notification.data?.url || 'https://luizhenrinq1-svg.github.io/testepontoweb/';

  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then( windowClients => {
      // 1. Tenta encontrar uma aba que já esteja no App
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        // Verifica se a URL da aba corresponde ao App (procura por parte do link)
        if (client.url.includes("pontowebtestets") && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. Se não achou, abre nova janela no link correto
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// === PWA ===
self.addEventListener('install', (event) => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

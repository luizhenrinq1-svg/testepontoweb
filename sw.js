const CACHE_NAME = 'pontoweb-v3-cache';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://cdn-icons-png.flaticon.com/512/2983/2983818.png'
];

// 1. INSTALAÇÃO: Baixa e salva os arquivos no Cache
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força a atualização do SW imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. ATIVAÇÃO: Limpa caches antigos para não ocupar espaço
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Assume o controle das abas abertas
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[Service Worker] Removendo cache antigo', key);
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

// 3. FETCH (Interceptação): Serve arquivos do Cache primeiro (Offline First)
self.addEventListener('fetch', (event) => {
  // Não cacheia chamadas para a API do Google (POST) ou links externos dinâmicos
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se estiver no cache, retorna rapidinho
      if (cachedResponse) {
        return cachedResponse;
      }
      // Se não, busca na rede
      return fetch(event.request).then((networkResponse) => {
        // Opcional: Cachear novas requisições dinamicamente (ex: sons)
        return networkResponse;
      });
    })
  );
});

// 4. NOTIFICAÇÕES (Mantém a lógica de abrir o app ao clicar)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(clientList) {
      // Tenta focar numa aba já aberta
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não tiver aberta, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});

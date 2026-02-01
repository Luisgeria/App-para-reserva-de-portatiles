// Service Worker para PWA - Versión corregida
const CACHE_NAME = 'reserva-portatiles-v1';

// Usar rutas relativas en lugar de absolutas
const urlsToCache = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando archivos');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('Service Worker: Error al cachear', err);
      })
  );
  // Forzar activación inmediata
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tomar control inmediato
  return self.clients.claim();
});

// Estrategia: Network First, luego Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la petición fue exitosa, guardar en caché
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde caché
        return caches.match(event.request);
      })
  );
});


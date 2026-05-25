const CACHE_NAME = 'dportas-v2.0';
const CACHE_VERSAO = 2;
const CACHE_ATUAL = `${CACHE_NAME}-${CACHE_VERSAO}`;

const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/offline.js',
    '/manifest.json',
    '/service-worker.js'
];

console.log('🔧 Service Worker carregado');

// INSTALAÇÃO DO SERVICE WORKER
self.addEventListener('install', event => {
    console.log('📦 Service Worker instalando...');
    
    event.waitUntil(
        caches.open(CACHE_ATUAL)
            .then(cache => {
                console.log('💾 Iniciando cache dos arquivos...');
                
                return Promise.all(
                    urlsToCache.map(url => {
                        return cache.add(url)
                            .catch(err => {
                                console.warn(`⚠️ Não consegui cachear ${url}:`, err);
                            });
                    })
                );
            })
            .then(() => {
                console.log('✅ Cache concluído');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('❌ Erro ao fazer cache:', err);
            })
    );
});

// ATIVAÇÃO DO SERVICE WORKER
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker ativando...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_ATUAL && cacheName.startsWith(CACHE_NAME))
                        .map(cacheName => {
                            console.log(`🗑️ Deletando cache antigo: ${cacheName}`);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('✅ Cache limpo e atualizado');
                return self.clients.claim();
            })
            .catch(err => {
                console.error('❌ Erro ao limpar cache:', err);
            })
    );
});

// ESTRATÉGIA: Network First (Rede primeiro)
function networkFirst(request) {
    return fetch(request)
        .then(response => {
            // Se a resposta é inválida, retornar do cache
            if (!response || response.status !== 200 || response.type === 'error') {
                return caches.match(request)
                    .then(cachedResponse => cachedResponse || response);
            }
            
            // Salvar resposta válida em cache
            const responseToCache = response.clone();
            caches.open(CACHE_ATUAL).then(cache => {
                cache.put(request, responseToCache);
            });
            
            return response;
        })
        .catch(() => {
            // Se falhar, retornar do cache
            return caches.match(request)
                .then(response => {
                    if (response) {
                        console.log(`📦 ${request.url} - do cache (offline)`);
                        return response;
                    }
                    return new Response('Recurso não disponível offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    });
                });
        });
}

// ESTRATÉGIA: Cache First (Cache primeiro)
function cacheFirst(request) {
    return caches.match(request)
        .then(response => {
            if (response) {
                console.log(`📦 ${request.url} - do cache`);
                return response;
            }
            
            // Se não tiver em cache, buscar da rede
            return fetch(request)
                .then(response => {
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }
                    
                    // Salvar a resposta em cache
                    const responseToCache = response.clone();
                    caches.open(CACHE_ATUAL).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    
                    return response;
                })
                .catch(() => {
                    return new Response('Página não disponível offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    });
                });
        });
}

// ESTRATÉGIA: Stale While Revalidate (Use cache, mas atualize em segundo plano)
function staleWhileRevalidate(request) {
    return caches.match(request)
        .then(response => {
            const fetchPromise = fetch(request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_ATUAL).then(cache => {
                            cache.put(request, networkResponse.clone());
                        });
                    }
                    return networkResponse;
                })
                .catch(() => response);
            
            return response || fetchPromise;
        });
}

// INTERCEPTAR REQUISIÇÕES
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // API - Network First (tenta rede, depois cache)
    if (url.pathname.includes('/api/')) {
        console.log(`📤 Network First: ${request.url}`);
        event.respondWith(networkFirst(request));
        return;
    }

    // Arquivos estáticos - Cache First
    if (request.method === 'GET' && 
        (url.pathname.endsWith('.js') || 
         url.pathname.endsWith('.css') || 
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.endsWith('.woff2'))) {
        console.log(`📦 Cache First: ${request.url}`);
        event.respondWith(cacheFirst(request));
        return;
    }

    // HTML - Stale While Revalidate
    if (url.pathname.endsWith('.html') || url.pathname === '/') {
        console.log(`🔄 Stale While Revalidate: ${request.url}`);
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // Padrão - Network First
    console.log(`📤 Padrão (Network First): ${request.url}`);
    event.respondWith(networkFirst(request));
});

// SINCRONIZAÇÃO EM BACKGROUND
self.addEventListener('sync', event => {
    console.log('🔄 Sincronização em background:', event.tag);
    
    if (event.tag === 'sync-dados') {
        event.waitUntil(sincronizarDadosBackground());
    }
});

async function sincronizarDadosBackground() {
    console.log('🔄 Iniciando sincronização em background...');
    
    try {
        const endpoints = [
            '/api/clientes',
            '/api/estoque',
            '/api/orcamentos',
            '/api/os',
            '/api/agenda'
        ];

        const resultados = await Promise.all(
            endpoints.map(endpoint =>
                fetch(endpoint, { method: 'GET' })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error(`Erro ao sincronizar ${endpoint}`);
                    })
            )
        );
        
        console.log('✅ Sincronização concluída com sucesso');
        
        // Notificar clientes
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_SUCCESS',
                message: 'Dados sincronizados com sucesso',
                dados: resultados
            });
        });
        
    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
        
        // Notificar clientes sobre erro
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_ERROR',
                message: 'Falha na sincronização'
            });
        });
    }
}

// PUSH NOTIFICATIONS
self.addEventListener('push', event => {
    console.log('📢 Push notification recebida');
    
    let notificationData = {
        title: 'DPortas',
        options: {
            body: 'Você tem uma nova notificação',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: 'notification',
            requireInteraction: false,
            vibrate: [200, 100, 200],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        }
    };
    
    if (event.data) {
        try {
            notificationData = event.data.json();
        } catch (e) {
            notificationData.options.body = event.data.text();
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData.options)
    );
});

// CLIQUE EM NOTIFICAÇÃO
self.addEventListener('notificationclick', event => {
    console.log('👆 Notificação clicada');
    
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                // Procurar janela aberta
                for (let client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Se não houver, abrir nova
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// FECHAR NOTIFICAÇÃO
self.addEventListener('notificationclose', event => {
    console.log('❌ Notificação fechada');
});

// MENSAGENS DO CLIENTE
self.addEventListener('message', event => {
    console.log('💬 Mensagem recebida do cliente:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_ATUAL).then(() => {
            event.ports[0].postMessage({
                success: true,
                message: 'Cache limpo'
            });
        });
    }
});

console.log('✅ Service Worker pronto para operação');
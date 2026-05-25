class GerenciadorOffline {
    constructor() {
        this.dbName = 'DportasDB';
        this.version = 1;
        this.db = null;
    }

    async inicializar() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('❌ Erro ao abrir IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB inicializado');
                this.limparDadosAntigos();
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const stores = ['clientes', 'estoque', 'orcamentos', 'os', 'agenda', 'sincronizacao'];
                
                stores.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { 
                            keyPath: 'id', 
                            autoIncrement: true 
                        });
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                        console.log(`✅ Object Store criado: ${storeName}`);
                    }
                });
            };
        });
    }

    async salvar(storeName, dados) {
        if (!this.db) {
            await this.inicializar();
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const dadosComTimestamp = {
                    ...dados,
                    timestamp: new Date().getTime()
                };
                
                const request = store.add(dadosComTimestamp);

                request.onsuccess = () => {
                    console.log(`✅ Dados salvos localmente: ${storeName}`);
                    resolve(request.result);
                };

                request.onerror = () => {
                    console.error(`❌ Erro ao salvar: ${storeName}`, request.error);
                    reject(request.error);
                };

                transaction.onerror = () => {
                    console.error('❌ Erro na transação:', transaction.error);
                    reject(transaction.error);
                };

            } catch (erro) {
                console.error('❌ Erro ao salvar:', erro);
                reject(erro);
            }
        });
    }

    async obter(storeName) {
        if (!this.db) {
            await this.inicializar();
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    console.log(`📂 Carregados ${request.result.length} itens de ${storeName}`);
                    resolve(request.result);
                };

                request.onerror = () => {
                    console.error(`❌ Erro ao obter: ${storeName}`, request.error);
                    reject(request.error);
                };

            } catch (erro) {
                console.error('❌ Erro ao obter:', erro);
                reject(erro);
            }
        });
    }

    async deletar(storeName, id) {
        if (!this.db) {
            await this.inicializar();
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(id);

                request.onsuccess = () => {
                    console.log(`✅ Deletado de ${storeName}: ${id}`);
                    resolve();
                };

                request.onerror = () => {
                    console.error(`❌ Erro ao deletar: ${storeName}`, request.error);
                    reject(request.error);
                };

            } catch (erro) {
                console.error('❌ Erro ao deletar:', erro);
                reject(erro);
            }
        });
    }

    async registrarSincronizacao(tabela, operacao, dados) {
        if (!this.db) {
            await this.inicializar();
        }

        try {
            const transaction = this.db.transaction(['sincronizacao'], 'readwrite');
            const store = transaction.objectStore('sincronizacao');
            store.add({
                tabela,
                operacao,
                dados,
                timestamp: new Date().getTime(),
                sincronizado: false
            });
            console.log(`📝 Operação registrada: ${operacao} em ${tabela}`);
        } catch (erro) {
            console.error('❌ Erro ao registrar sincronização:', erro);
        }
    }

    async obterNaoSincronizados() {
        if (!this.db) {
            await this.inicializar();
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['sincronizacao'], 'readonly');
                const store = transaction.objectStore('sincronizacao');
                const request = store.getAll();

                request.onsuccess = () => {
                    const naoSync = request.result.filter(d => !d.sincronizado);
                    console.log(`📋 ${naoSync.length} itens aguardando sincronização`);
                    resolve(naoSync);
                };

                request.onerror = () => reject(request.error);

            } catch (erro) {
                console.error('❌ Erro ao obter não sincronizados:', erro);
                reject(erro);
            }
        });
    }

    async marcarSincronizado(id) {
        if (!this.db) {
            await this.inicializar();
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['sincronizacao'], 'readwrite');
                const store = transaction.objectStore('sincronizacao');
                const request = store.get(id);

                request.onsuccess = () => {
                    const dados = request.result;
                    if (dados) {
                        dados.sincronizado = true;
                        store.put(dados);
                        console.log(`✅ Marcado como sincronizado: ${id}`);
                    }
                    resolve();
                };

                request.onerror = () => reject(request.error);

            } catch (erro) {
                console.error('❌ Erro ao marcar sincronizado:', erro);
                reject(erro);
            }
        });
    }

    async limpar(storeName) {
        if (!this.db) {
            await this.inicializar();
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => {
                    console.log(`🗑️ ${storeName} limpo`);
                    resolve();
                };

                request.onerror = () => reject(request.error);

            } catch (erro) {
                console.error('❌ Erro ao limpar:', erro);
                reject(erro);
            }
        });
    }

    async limparDadosAntigos(dias = 30) {
        if (!this.db) {
            await this.inicializar();
        }

        const limiteTime = Date.now() - (dias * 24 * 60 * 60 * 1000);
        const stores = ['clientes', 'estoque', 'orcamentos', 'os', 'agenda'];

        for (let storeName of stores) {
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const index = store.index('timestamp');
                const range = IDBKeyRange.upperBound(limiteTime);
                const request = index.openCursor(range);

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        store.delete(cursor.primaryKey);
                        cursor.continue();
                    }
                };

            } catch (erro) {
                console.warn(`⚠️ Não conseguiu limpar ${storeName}:`, erro);
            }
        }

        console.log(`🧹 Dados antigos (+${dias} dias) removidos`);
    }

    async atualizarDado(storeName, id, dadosAtualizados) {
        if (!this.db) {
            await this.inicializar();
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.get(id);

                request.onsuccess = () => {
                    const dado = request.result;
                    if (dado) {
                        const dadoAtualizado = { ...dado, ...dadosAtualizados };
                        const updateRequest = store.put(dadoAtualizado);
                        
                        updateRequest.onsuccess = () => {
                            console.log(`✅ Dado atualizado em ${storeName}: ${id}`);
                            resolve(dadoAtualizado);
                        };
                        
                        updateRequest.onerror = () => reject(updateRequest.error);
                    } else {
                        reject(new Error(`Registro não encontrado: ${id}`));
                    }
                };

                request.onerror = () => reject(request.error);

            } catch (erro) {
                console.error('❌ Erro ao atualizar dado:', erro);
                reject(erro);
            }
        });
    }

    async buscarPorFiltro(storeName, filtro) {
        if (!this.db) {
            await this.inicializar();
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    const resultados = request.result.filter(item => {
                        for (let chave in filtro) {
                            if (item[chave] !== filtro[chave]) {
                                return false;
                            }
                        }
                        return true;
                    });
                    console.log(`🔍 ${resultados.length} itens encontrados em ${storeName}`);
                    resolve(resultados);
                };

                request.onerror = () => reject(request.error);

            } catch (erro) {
                console.error('❌ Erro ao buscar:', erro);
                reject(erro);
            }
        });
    }
}

// Instanciar gerenciador global
const offline = new GerenciadorOffline();

// Inicializar automaticamente ao carregar
offline.inicializar().catch(err => {
    console.error('❌ Falha ao inicializar IndexedDB:', err);
});

console.log('✅ offline.js carregado com sucesso');
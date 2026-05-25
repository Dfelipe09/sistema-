console.log("✅ SISTEMA DPORTAS v2.0 - FRONTEND CARREGADO");

const API_BASE_URL = 'http://localhost:8080/api';
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

let usandoOffline = !navigator.onLine;
let dados = {
    clientes: [],
    estoque: [],
    orcamentos: [],
    os: [],
    agenda: []
};

async function fazerRequisicao(metodo, endpoint, corpo = null) {
    let ultimoErro;
    
    for (let tentativa = 0; tentativa < RETRY_ATTEMPTS; tentativa++) {
        try {
            const opcoes = {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };
            
            if (corpo) {
                opcoes.body = JSON.stringify(corpo);
            }
            
            const url = `${API_BASE_URL}${endpoint}`;
            console.log(`📤 ${metodo} ${url}`);
            
            const resposta = await fetch(url, opcoes);
            
            if (!resposta.ok) {
                if (resposta.status === 404) throw new Error('Recurso não encontrado');
                if (resposta.status === 500) throw new Error('Erro no servidor');
                throw new Error(`Erro HTTP ${resposta.status}`);
            }
            
            const dados = await resposta.json();
            console.log(`✅ Sucesso em ${endpoint}`);
            return dados;
            
        } catch (erro) {
            ultimoErro = erro;
            console.warn(`⚠️ Tentativa ${tentativa + 1}/${RETRY_ATTEMPTS} falhou: ${erro.message}`);
            
            if (tentativa < RETRY_ATTEMPTS - 1) {
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS * (tentativa + 1)));
            }
        }
    }
    
    throw ultimoErro;
}

async function sincronizarDados() {
    console.log("🔄 Sincronizando com servidor...");
    
    if (usandoOffline) {
        exibirErro("Sem conexão. Usando dados locais.");
        return;
    }
    
    try {
        const [clientes, estoque, orcamentos, os, agenda] = await Promise.all([
            fazerRequisicao('GET', '/clientes'),
            fazerRequisicao('GET', '/estoque'),
            fazerRequisicao('GET', '/orcamentos'),
            fazerRequisicao('GET', '/os'),
            fazerRequisicao('GET', '/agenda')
        ]);
        
        dados.clientes = clientes || [];
        dados.estoque = estoque || [];
        dados.orcamentos = orcamentos || [];
        dados.os = os || [];
        dados.agenda = agenda || [];
        
        await salvarLocalmente();
        
        console.log('✅ Sincronização completa');
        exibirSucesso('Dados sincronizados com sucesso!');
        atualizarUI();
        
    } catch (erro) {
        console.error('❌ Erro na sincronização:', erro);
        exibirErro('Erro ao sincronizar. Usando dados locais.');
        await carregarLocalmente();
        atualizarUI();
    }
}

async function salvarLocalmente() {
    try {
        localStorage.setItem('dportas_dados', JSON.stringify(dados));
        localStorage.setItem('dportas_timestamp', new Date().toISOString());
        console.log('💾 Dados salvos localmente');
    } catch (erro) {
        console.error('❌ Erro ao salvar localmente:', erro);
    }
}

async function carregarLocalmente() {
    try {
        const dadosSalvos = localStorage.getItem('dportas_dados');
        if (dadosSalvos) {
            dados = JSON.parse(dadosSalvos);
            console.log('📂 Dados carregados do localStorage');
            return true;
        }
    } catch (erro) {
        console.error('❌ Erro ao carregar localmente:', erro);
    }
    return false;
}

function verificarConexao() {
    const online = navigator.onLine;
    const statusDot = document.getElementById('statusOnline');
    const statusTexto = document.getElementById('statusTexto');
    
    if (online) {
        statusDot.classList.remove('offline');
        statusDot.classList.add('online');
        statusTexto.textContent = 'Online';
        usandoOffline = false;
        console.log('✅ Conexão restabelecida');
    } else {
        statusDot.classList.remove('online');
        statusDot.classList.add('offline');
        statusTexto.textContent = 'Offline';
        usandoOffline = true;
        exibirNotificacao('Modo Offline - dados serão sincronizados depois', 'info');
        console.log('⚠️ Modo offline ativado');
    }
}

window.addEventListener('online', () => {
    verificarConexao();
    sincronizarDados();
});

window.addEventListener('offline', verificarConexao);

async function inicializarSistema() {
    console.log("🚀 Inicializando sistema...");
    
    try {
        verificarConexao();
        
        if (!usandoOffline) {
            await sincronizarDados();
        } else {
            await carregarLocalmente();
            atualizarUI();
        }
        
        exibirStatusSistema();
        
    } catch (erro) {
        console.error('❌ Erro ao inicializar:', erro);
        await carregarLocalmente();
        atualizarUI();
        exibirErro('Falha ao conectar. Usando dados locais.');
    }
}

function mudarTela(telaAlvo) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
    document.querySelectorAll('.menu button').forEach(b => b.classList.remove('ativo'));
    
    const tela = document.getElementById(`tela-${telaAlvo}`);
    const botao = document.getElementById(`btn-${telaAlvo}`);
    
    if (tela) tela.classList.add('ativa');
    if (botao) botao.classList.add('ativo');
}

function toggleParcelas() {
    const pagamento = document.getElementById('orcPagamento');
    const divParcelas = document.getElementById('divParcelas');
    
    if (!pagamento) {
        console.warn('⚠️ Elemento orcPagamento não encontrado');
        return;
    }
    
    if (!divParcelas) {
        console.warn('⚠️ Elemento divParcelas não encontrado');
        return;
    }
    
    divParcelas.style.display = 
        pagamento.value === 'Cartão de Crédito' ? 'block' : 'none';
}

function exibirNotificacao(mensagem, tipo = 'info') {
    const notif = document.createElement('div');
    notif.className = `notificacao ${tipo}`;
    notif.textContent = mensagem;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

function exibirSucesso(mensagem) {
    console.log("✅ " + mensagem);
    exibirNotificacao(mensagem, 'sucesso');
}

function exibirErro(mensagem) {
    console.error("❌ " + mensagem);
    exibirNotificacao(mensagem, 'erro');
}

function validarEmail(email) {
    if (!email) return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function normalizarTelefone(telefone) {
    const apenasNumeros = telefone.replace(/\D/g, '');
    const ultimosOnze = apenasNumeros.slice(-11);
    
    if (ultimosOnze.length !== 11) {
        throw new Error("Telefone inválido. Use formato: (XX) 9XXXX-XXXX");
    }
    
    return ultimosOnze;
}

document.getElementById('formCliente').onsubmit = async (e) => {
    e.preventDefault();
    
    try {
        const nome = document.getElementById('nomeCliente').value.trim();
        const telefone = document.getElementById('telCliente').value.trim();
        const email = document.getElementById('emailCliente').value.trim();
        const visita = document.getElementById('visitaCliente').value.trim();
        
        if (!nome) {
            exibirErro("Digite o nome do cliente");
            return;
        }
        
        if (!telefone) {
            exibirErro("Digite o telefone");
            return;
        }
        
        if (email && !validarEmail(email)) {
            exibirErro("Email inválido");
            return;
        }
        
        const cliente = {
            nome,
            telefone,
            email: email || null,
            ultimaVisita: visita
        };
        
        const resposta = await fazerRequisicao('POST', '/clientes', cliente);
        
        dados.clientes.push(resposta);
        await salvarLocalmente();
        
        exibirSucesso("✅ Cliente salvo!");
        e.target.reset();
        atualizarListaClientes();
        atualizarSelectClientes();
        
    } catch (err) {
        exibirErro("Erro ao salvar cliente: " + err.message);
    }
};

async function deletarCliente(id) {
    if (!confirm("Tem certeza que deseja deletar este cliente?")) return;
    
    try {
        await fazerRequisicao('DELETE', `/clientes/${id}`);
        
        dados.clientes = dados.clientes.filter(c => c.id !== id);
        await salvarLocalmente();
        
        exibirSucesso("✅ Cliente deletado!");
        atualizarListaClientes();
        atualizarSelectClientes();
        
    } catch (err) {
        exibirErro("Erro ao deletar: " + err.message);
    }
}

function atualizarListaClientes() {
    const container = document.getElementById('listaClientes');
    
    if (dados.clientes.length === 0) {
        container.innerHTML = '<div class="lista-vazia">Nenhum cliente cadastrado</div>';
        return;
    }
    
    let html = '<div class="lista-titulo">👥 Clientes Cadastrados</div>';
    
    dados.clientes.forEach((cliente) => {
        html += `
            <div class="item-lista">
                <div class="item-info">
                    <strong>${cliente.nome}</strong>
                    <small>📞 ${cliente.telefone || 'Sem telefone'} | 📧 ${cliente.email || 'N/A'}</small>
                </div>
                <div class="item-acoes">
                    <button class="btn-acao btn-whatsapp" onclick="abrirWhatsapp('${cliente.telefone}')">💬 WhatsApp</button>
                    <button class="btn-acao btn-deletar" onclick="deletarCliente(${cliente.id})">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function abrirWhatsapp(telefone) {
    try {
        if (!telefone) {
            exibirErro("Cliente sem telefone cadastrado");
            return;
        }
        
        const telefoneLimpo = normalizarTelefone(telefone);
        const url = `https://wa.me/55${telefoneLimpo}`;
        window.open(url, '_blank');
        
    } catch (erro) {
        exibirErro(erro.message);
    }
}

function atualizarSelectClientes() {
    const selects = ['orcCliente', 'osCliente', 'agendaCliente'];
    
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (!select) {
            console.warn(`⚠️ Select ${id} não encontrado`);
            return;
        }
        
        select.innerHTML = '<option value="">Selecione um cliente...</option>';
        dados.clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.nome;
            select.appendChild(option);
        });
    });
}

document.getElementById('formEstoque').onsubmit = async (e) => {
    e.preventDefault();
    
    try {
        const produto = document.getElementById('nomeProduto').value.trim();
        const quantidade = Number(document.getElementById('qtdProduto').value);
        const preco = Number(document.getElementById('precoProduto').value) || 0;
        
        if (!produto) {
            exibirErro("Digite o nome do produto");
            return;
        }
        
        if (quantidade < 0) {
            exibirErro("Quantidade não pode ser negativa");
            return;
        }
        
        const item = { produto, quantidade, preco };
        
        const resposta = await fazerRequisicao('POST', '/estoque', item);
        dados.estoque.push(resposta);
        await salvarLocalmente();
        
        exibirSucesso("✅ Produto salvo!");
        e.target.reset();
        atualizarListaEstoque();
        
    } catch (err) {
        exibirErro("Erro ao salvar produto: " + err.message);
    }
};

async function deletarEstoque(id) {
    if (!confirm("Tem certeza?")) return;
    
    try {
        await fazerRequisicao('DELETE', `/estoque/${id}`);
        dados.estoque = dados.estoque.filter(e => e.id !== id);
        await salvarLocalmente();
        
        exibirSucesso("✅ Produto deletado!");
        atualizarListaEstoque();
        
    } catch (err) {
        exibirErro("Erro ao deletar: " + err.message);
    }
}

function atualizarListaEstoque() {
    const container = document.getElementById('listaEstoque');
    
    if (dados.estoque.length === 0) {
        container.innerHTML = '<div class="lista-vazia">Nenhum produto no estoque</div>';
        return;
    }
    
    let html = '<div class="lista-titulo">📦 Produtos em Estoque</div>';
    
    dados.estoque.forEach((item) => {
        const cor = item.quantidade <= 5 ? '#e74c3c' : '#27ae60';
        html += `
            <div class="item-lista">
                <div class="item-info">
                    <strong>${item.produto}</strong>
                    <small>Qtd: <span style="color: ${cor}; font-weight: bold;">${item.quantidade} un</span> | R$ ${Number(item.preco || 0).toFixed(2)}</small>
                </div>
                <div class="item-acoes">
                    <button class="btn-acao btn-deletar" onclick="deletarEstoque(${item.id})">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

document.getElementById('formOrcamento').onsubmit = async (e) => {
    e.preventDefault();
    
    try {
        const cliente_id = Number(document.getElementById('orcCliente').value);
        const descricao = document.getElementById('orcDescricao').value.trim();
        const valor = Number(document.getElementById('orcValor').value);
        const pagamento = document.getElementById('orcPagamento').value;
        const parcelas = document.getElementById('orcParcelas').value || 1;
        
        if (!cliente_id || !descricao || !valor || !pagamento) {
            exibirErro("Preencha todos os campos obrigatórios");
            return;
        }
        
        const orcamento = { cliente_id, descricao, valor, pagamento, parcelas };
        
        const resposta = await fazerRequisicao('POST', '/orcamentos', orcamento);
        dados.orcamentos.push(resposta);
        await salvarLocalmente();
        
        exibirSucesso("✅ Orçamento salvo!");
        e.target.reset();
        atualizarListaOrcamentos();
        
    } catch (err) {
        exibirErro("Erro: " + err.message);
    }
};

async function deletarOrcamento(id) {
    if (!confirm("Tem certeza?")) return;
    
    try {
        await fazerRequisicao('DELETE', `/orcamentos/${id}`);
        dados.orcamentos = dados.orcamentos.filter(o => o.id !== id);
        await salvarLocalmente();
        
        exibirSucesso("✅ Orçamento deletado!");
        atualizarListaOrcamentos();
        
    } catch (err) {
        exibirErro("Erro: " + err.message);
    }
}

function atualizarListaOrcamentos() {
    const container = document.getElementById('listaOrcamentos');
    
    if (dados.orcamentos.length === 0) {
        container.innerHTML = '<div class="lista-vazia">Nenhum orçamento</div>';
        return;
    }
    
    let html = '<div class="lista-titulo">💰 Orçamentos</div>';
    
    dados.orcamentos.forEach((orc) => {
        const cliente = dados.clientes.find(c => c.id === orc.cliente_id);
        html += `
            <div class="item-lista">
                <div class="item-info">
                    <strong>${cliente ? cliente.nome : 'Desconhecido'}</strong>
                    <small>R$ ${Number(orc.valor).toFixed(2)} | ${orc.pagamento}</small>
                </div>
                <div class="item-acoes">
                    <button class="btn-acao btn-deletar" onclick="deletarOrcamento(${orc.id})">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

document.getElementById('formOS').onsubmit = async (e) => {
    e.preventDefault();
    
    try {
        const cliente_id = Number(document.getElementById('osCliente').value);
        const descricao = document.getElementById('osDescricao').value.trim();
        const data = document.getElementById('osData').value;
        const status = document.getElementById('osStatus').value;
        
        if (!cliente_id || !descricao || !data || !status) {
            exibirErro("Preencha todos os campos");
            return;
        }
        
        const os = { cliente_id, descricao, data, status };
        
        const resposta = await fazerRequisicao('POST', '/os', os);
        dados.os.push(resposta);
        await salvarLocalmente();
        
        exibirSucesso("✅ O.S. salva!");
        e.target.reset();
        atualizarListaOS();
        
    } catch (err) {
        exibirErro("Erro: " + err.message);
    }
};

async function deletarOS(id) {
    if (!confirm("Tem certeza?")) return;
    
    try {
        await fazerRequisicao('DELETE', `/os/${id}`);
        dados.os = dados.os.filter(o => o.id !== id);
        await salvarLocalmente();
        
        exibirSucesso("✅ O.S. deletada!");
        atualizarListaOS();
        
    } catch (err) {
        exibirErro("Erro: " + err.message);
    }
}

function atualizarListaOS() {
    const container = document.getElementById('listaOS');
    
    if (dados.os.length === 0) {
        container.innerHTML = '<div class="lista-vazia">Nenhuma O.S.</div>';
        return;
    }
    
    let html = '<div class="lista-titulo">🛠️ Ordens de Serviço</div>';
    
    dados.os.forEach((servico) => {
        const cliente = dados.clientes.find(c => c.id === servico.cliente_id);
        html += `
            <div class="item-lista">
                <div class="item-info">
                    <strong>${cliente ? cliente.nome : 'Desconhecido'}</strong>
                    <small>${servico.status}</small>
                </div>
                <div class="item-acoes">
                    <button class="btn-acao btn-deletar" onclick="deletarOS(${servico.id})">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

document.getElementById('formAgenda').onsubmit = async (e) => {
    e.preventDefault();
    
    try {
        const cliente_id = Number(document.getElementById('agendaCliente').value);
        const data = document.getElementById('agendaData').value;
        const hora = document.getElementById('agendaHora').value;
        const observacoes = document.getElementById('agendaObs').value;
        
        if (!cliente_id || !data || !hora) {
            exibirErro("Preencha os campos obrigatórios");
            return;
        }
        
        const agenda = { cliente_id, data, hora, observacoes };
        
        const resposta = await fazerRequisicao('POST', '/agenda', agenda);
        dados.agenda.push(resposta);
        await salvarLocalmente();
        
        exibirSucesso("✅ Visita agendada!");
        e.target.reset();
        atualizarListaAgenda();
        
    } catch (err) {
        exibirErro("Erro: " + err.message);
    }
};

async function deletarAgenda(id) {
    if (!confirm("Tem certeza?")) return;
    
    try {
        await fazerRequisicao('DELETE', `/agenda/${id}`);
        dados.agenda = dados.agenda.filter(a => a.id !== id);
        await salvarLocalmente();
        
        exibirSucesso("✅ Visita deletada!");
        atualizarListaAgenda();
        
    } catch (err) {
        exibirErro("Erro: " + err.message);
    }
}

function atualizarListaAgenda() {
    const container = document.getElementById('listaAgenda');
    
    if (dados.agenda.length === 0) {
        container.innerHTML = '<div class="lista-vazia">Nenhuma visita agendada</div>';
        return;
    }
    
    let html = '<div class="lista-titulo">📅 Agenda</div>';
    
    dados.agenda.forEach((visita) => {
        const cliente = dados.clientes.find(c => c.id === visita.cliente_id);
        html += `
            <div class="item-lista">
                <div class="item-info">
                    <strong>${cliente ? cliente.nome : 'Desconhecido'}</strong>
                    <small>📅 ${visita.data} às ${visita.hora}</small>
                </div>
                <div class="item-acoes">
                    <button class="btn-acao btn-deletar" onclick="deletarAgenda(${visita.id})">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function atualizarUI() {
    atualizarListaClientes();
    atualizarListaEstoque();
    atualizarListaOrcamentos();
    atualizarListaOS();
    atualizarListaAgenda();
    atualizarSelectClientes();
}

function exibirStatusSistema() {
    const modo = usandoOffline ? '📴 Modo Offline' : '📡 Modo Online';
    const clientes = dados.clientes.length;
    const produtos = dados.estoque.length;
    const orcamentos = dados.orcamentos.length;
    
    const statusHtml = `
        ${modo} | Clientes: ${clientes} | Produtos: ${produtos} | Orçamentos: ${orcamentos}
    `;
    
    const statusEl = document.getElementById('statusSistema');
    if (statusEl) {
        statusEl.textContent = statusHtml;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistema);
} else {
    inicializarSistema();
}

setInterval(exibirStatusSistema, 5000);
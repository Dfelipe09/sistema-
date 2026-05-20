// --- 1. BANCO DE DADOS (LOCALSTORAGE) ---
let bd = {
    clientes: JSON.parse(localStorage.getItem('dp_clientes')) || [],
    estoque: JSON.parse(localStorage.getItem('dp_estoque')) || [],
    orcamentos: JSON.parse(localStorage.getItem('dp_orcamentos')) || [],
    os: JSON.parse(localStorage.getItem('dp_os')) || [],
    agenda: JSON.parse(localStorage.getItem('dp_agenda')) || [],
    lixeira: JSON.parse(localStorage.getItem('dp_lixeira')) || []
};

function salvarTudo() {
    localStorage.setItem('dp_clientes', JSON.stringify(bd.clientes));
    localStorage.setItem('dp_estoque', JSON.stringify(bd.estoque));
    localStorage.setItem('dp_orcamentos', JSON.stringify(bd.orcamentos));
    localStorage.setItem('dp_os', JSON.stringify(bd.os));
    localStorage.setItem('dp_agenda', JSON.stringify(bd.agenda));
    localStorage.setItem('dp_lixeira', JSON.stringify(bd.lixeira));
    atualizarTodasListas();
}

// --- 2. NAVEGAÇÃO ENTRE ABAS ---
function mudarTela(telaAlvo) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
    document.querySelectorAll('.menu button').forEach(b => b.classList.remove('ativo'));
    document.getElementById(`tela-${telaAlvo}`).classList.add('ativa');
    document.getElementById(`btn-${telaAlvo}`).classList.add('ativo');
}

// --- 3. FUNÇÕES DE RENDERIZAÇÃO (MOSTRAR NA TELA) ---
function atualizarTodasListas() {
    // Clientes
    let htmlClientes = bd.clientes.length ? "" : "<p>Nenhum cliente cadastrado.</p>";
    bd.clientes.forEach((c, i) => {
        htmlClientes += `<div class="item-lista">
            <div class="item-header"><strong>${c.nome}</strong></div>
            <span>📞 ${c.telefone} | Última visita: ${c.ultimaVisita}</span>
            <div><button class="btn-acao btn-del" onclick="moverParaLixeira('clientes', ${i})">🗑️ Apagar</button></div>
        </div>`;
    });
    document.getElementById('listaClientes').innerHTML = "<h3>Lista de Clientes</h3>" + htmlClientes;

    // Estoque
    let htmlEstoque = bd.estoque.length ? "" : "<p>Estoque vazio.</p>";
    bd.estoque.forEach((e, i) => {
        let alerta = e.quantidade < 5 ? `<span style="color:red; font-weight:bold;">(Estoque Baixo!)</span>` : "";
        htmlEstoque += `<div class="item-lista">
            <div class="item-header"><strong>${e.produto}</strong></div>
            <span>Quantidade: ${e.quantidade} un. ${alerta}</span>
            <div style="margin-top: 10px;">
                <button class="btn-acao btn-ok" onclick="alterarEstoque(${i}, 'add')">➕ Entrada</button>
                <button class="btn-acao" style="background-color: #f39c12; color: white;" onclick="alterarEstoque(${i}, 'sub')">➖ Saída</button>
                <button class="btn-acao btn-del" onclick="moverParaLixeira('estoque', ${i})">🗑️ Apagar</button>
            </div>
        </div>`;
    });
    document.getElementById('listaEstoque').innerHTML = "<h3>Estoque Atual</h3>" + htmlEstoque;

    // O.S.
    let htmlOS = bd.os.length ? "" : "<p>Nenhuma O.S. aberta.</p>";
    bd.os.forEach((os, i) => {
        let badge = os.status === 'Concluída' ? 'badge badge-ok' : 'badge';
        let btnConcluir = os.status !== 'Concluída' ? `<button class="btn-acao btn-ok" onclick="concluirOS(${i})">✅ Finalizar</button>` : "";
        htmlOS += `<div class="item-lista">
            <div class="item-header"><strong>OS #${i+1} - ${os.cliente}</strong> <span class="${badge}">${os.status}</span></div>
            <span>${os.descricao}</span>
            <div>${btnConcluir} <button class="btn-acao btn-del" onclick="moverParaLixeira('os', ${i})">🗑️ Apagar</button></div>
        </div>`;
    });
    document.getElementById('listaOS').innerHTML = "<h3>Ordens de Serviço</h3>" + htmlOS;

    // Agenda
    let htmlAgenda = bd.agenda.length ? "" : "<p>Agenda vazia.</p>";
    bd.agenda.forEach((a, i) => {
        let msgWpp = `Olá ${a.cliente}, confirmando agendamento DPortas: ${a.data} às ${a.hora} para ${a.servico}.`;
        htmlAgenda += `<div class="item-lista">
            <div class="item-header"><strong>📅 ${a.data} às ${a.hora} - ${a.cliente}</strong></div>
            <span>Serviço: ${a.servico}</span>
            <div>
                <button class="btn-acao btn-wpp" onclick="window.open('https://wa.me/?text=${encodeURIComponent(msgWpp)}', '_blank')">📱 Enviar WhatsApp</button>
                <button class="btn-acao btn-del" onclick="moverParaLixeira('agenda', ${i})">🗑️ Apagar</button>
            </div>
        </div>`;
    });
    document.getElementById('listaAgenda').innerHTML = "<h3>Compromissos</h3>" + htmlAgenda;

    // Lixeira
    let htmlLixeira = bd.lixeira.length ? "" : "<p>Lixeira vazia.</p>";
    bd.lixeira.forEach((l, i) => {
        let nomeItem = l.dados.nome || l.dados.produto || l.dados.cliente || "Item";
        htmlLixeira += `<div class="item-lista">
            <div class="item-header"><strong>[${l.tipo.toUpperCase()}] ${nomeItem}</strong></div>
            <div>
                <button class="btn-acao btn-ok" onclick="restaurarLixeira(${i})">🔄 Restaurar</button>
                <button class="btn-acao btn-del" onclick="excluirPermanente(${i})">❌ Excluir Definitivo</button>
            </div>
        </div>`;
    });
    document.getElementById('listaLixeira').innerHTML = htmlLixeira;
}

// --- 4. AÇÕES DOS BOTÕES ---
function alterarEstoque(index, operacao) {
    let acaoTexto = operacao === 'add' ? "ADICIONAR ao" : "REMOVER do";
    let produtoNome = bd.estoque[index].produto;
    let qtdStr = prompt(`Quantos itens você deseja ${acaoTexto} estoque de "${produtoNome}"?`);
    if (qtdStr === null || qtdStr.trim() === "") return; 
    let qtd = parseInt(qtdStr);
    
    if (isNaN(qtd) || qtd <= 0) {
        alert("Por favor, digite um número válido maior que zero.");
        return;
    }

    if (operacao === 'add') {
        bd.estoque[index].quantidade += qtd;
    } else if (operacao === 'sub') {
        if (bd.estoque[index].quantidade >= qtd) {
            bd.estoque[index].quantidade -= qtd;
        } else {
            alert(`Erro: Você só tem ${bd.estoque[index].quantidade} unidades no estoque. Não é possível remover ${qtd}.`);
            return;
        }
    }
    salvarTudo();
}

function moverParaLixeira(tipo, index) {
    if(confirm("Deseja enviar este item para a lixeira?")) {
        let removido = bd[tipo].splice(index, 1)[0];
        bd.lixeira.push({ tipo: tipo, dados: removido });
        salvarTudo();
    }
}

function restaurarLixeira(index) {
    let item = bd.lixeira.splice(index, 1)[0];
    bd[item.tipo].push(item.dados);
    salvarTudo();
    alert("Item restaurado com sucesso!");
}

function excluirPermanente(index) {
    if(confirm("Atenção! Isso apagará o item para sempre. Continuar?")) {
        bd.lixeira.splice(index, 1);
        salvarTudo();
    }
}

function concluirOS(index) {
    bd.os[index].status = "Concluída";
    salvarTudo();
}

// --- 5. EVENTOS DE FORMULÁRIO ---
document.getElementById('formCliente').onsubmit = (e) => {
    e.preventDefault();
    bd.clientes.push({
        nome: document.getElementById('nomeCliente').value,
        telefone: document.getElementById('telCliente').value.replace(/\D/g, ''),
        ultimaVisita: document.getElementById('visitaCliente').value
    });
    e.target.reset(); salvarTudo(); alert('Cliente salvo!');
};

document.getElementById('formEstoque').onsubmit = (e) => {
    e.preventDefault();
    bd.estoque.push({
        produto: document.getElementById('nomeProduto').value,
        quantidade: Number(document.getElementById('qtdProduto').value)
    });
    e.target.reset(); salvarTudo(); alert('Produto salvo!');
};

// --- ORÇAMENTO: SALVA NO BANCO SILENCIOSAMENTE E ABRE WHATSAPP ---
document.getElementById('formOrcamento').onsubmit = (e) => {
    e.preventDefault();
    
    let cliente = document.getElementById('orcCliente').value;
    let descricao = document.getElementById('orcDesc').value;
    let valorDigitado = document.getElementById('orcValor').value;
    
    // Converte o que for digitado (ex: 1.173,00 ou 1173) para número do Javascript
    let valorTratado = parseFloat(valorDigitado.replace(/\./g, '').replace(',', '.'));
    let formaPgto = document.getElementById('orcPagamento').value;

    if (isNaN(valorTratado)) {
        alert("Por favor, digite um valor válido. Exemplo: 1173 ou 1173,00");
        return;
    }

    let valorFinal = valorTratado;
    let msgDesconto = "";
    let teveDesconto = false;

    // Se for Pix ou Dinheiro, aplica 5% de desconto
    if (formaPgto === "Pix" || formaPgto === "Dinheiro") {
        valorFinal = valorTratado - (valorTratado * 0.05);
        msgDesconto = " *(5% de desconto já aplicado!)*";
        teveDesconto = true;
    }

    // 1. SALVAR NO BANCO DE DADOS LOCAL (Fica oculto na tela, mas gravado)
    bd.orcamentos.push({
        cliente: cliente,
        descricao: descricao,
        valorOriginal: valorTratado,
        valor: valorFinal,
        pagamento: formaPgto,
        desconto: teveDesconto,
        dataGerado: new Date().toLocaleDateString('pt-BR')
    });
    localStorage.setItem('dp_orcamentos', JSON.stringify(bd.orcamentos));

    // 2. MONTAGEM DA MENSAGEM DO WHATSAPP
    let valorFormatado = valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    let textoWpp = `*Orçamento - DPortas* 🚪\n\n`;
    textoWpp += `👤 *Cliente:* ${cliente}\n`;
    textoWpp += `🛠️ *Serviço:* ${descricao}\n`;
    textoWpp += `💳 *Forma de Pagamento:* ${formaPgto}\n`;
    textoWpp += `💰 *Valor Final:* ${valorFormatado}${msgDesconto}\n\n`;
    textoWpp += `Ficamos à disposição! Podemos confirmar o serviço?`;

    // 3. ABRIR WHATSAPP
    window.open(`https://wa.me/?text=${encodeURIComponent(textoWpp)}`, '_blank');
    
    // Limpa os campos do formulário para o próximo uso
    e.target.reset(); 
};

document.getElementById('formOS').onsubmit = (e) => {
    e.preventDefault();
    bd.os.push({
        cliente: document.getElementById('osCliente').value,
        descricao: document.getElementById('osDesc').value,
        status: "Em Andamento"
    });
    e.target.reset(); salvarTudo(); alert('O.S. Criada!');
};

document.getElementById('formAgenda').onsubmit = (e) => {
    e.preventDefault();
    bd.agenda.push({
        cliente: document.getElementById('agCliente').value,
        data: document.getElementById('agData').value,
        hora: document.getElementById('agHora').value,
        servico: document.getElementById('agServico').value
    });
    e.target.reset(); salvarTudo(); alert('Agendado com sucesso!');
};

// Inicializar o sistema ao abrir
atualizarTodasListas();
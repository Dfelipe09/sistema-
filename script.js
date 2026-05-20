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

    // Histórico de Orçamentos (Vai para a nova aba)
    let htmlOrcamentos = bd.orcamentos.length ? "" : "<p>Nenhum orçamento salvo no histórico.</p>";
    bd.orcamentos.forEach((orc, i) => {
        let valorFmt = orc.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let textoFmtCurto = `*Orçamento DPortas*\nCliente: ${orc.cliente}\nValor: ${valorFmt}\nServiço: ${orc.descricao}`;
        
        htmlOrcamentos += `<div class="item-lista">
            <div class="item-header"><strong>Nº ${i+1001} - ${orc.cliente}</strong> <span class="badge badge-ok">${orc.dataGerado}</span></div>
            <span style="font-size:13px; color:#555; max-width: 90%; display:block; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${orc.descricao}</span>
            <span><strong>Valor:</strong> ${valorFmt} (${orc.pagamento})</span>
            <div style="margin-top: 10px;">
                <button class="btn-acao btn-pdf" onclick="gerarPDF(${i})">📄 Gerar PDF</button>
                <button class="btn-acao btn-wpp" onclick="window.open('https://wa.me/?text=${encodeURIComponent(textoFmtCurto)}', '_blank')">📱 Enviar Wpp</button>
                <button class="btn-acao btn-del" onclick="moverParaLixeira('orcamentos', ${i})">🗑️ Apagar</button>
            </div>
        </div>`;
    });
    document.getElementById('listaOrcamentos').innerHTML = htmlOrcamentos;

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

// --- 4. GERADOR DE PDF 100% CORRIGIDO E FUNCIONAL ---
// Agora ele abre em uma NOVA ABA, monta o documento e aciona a impressão.
function gerarPDF(index) {
    let orc = bd.orcamentos[index];
    let numOrc = index + 1001;
    
    let valOriginalFmt = orc.valorOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    let valFinalFmt = orc.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Abre uma nova janela do navegador
    let janelaPDF = window.open('', '_blank');
    
    if (!janelaPDF) {
        alert("O seu navegador bloqueou a janela. Por favor, permita pop-ups para este site.");
        return;
    }

    // Escreve o código HTML do orçamento corporativo na nova janela
    janelaPDF.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Orçamento DPortas #${numOrc}</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 30px; color: #333; line-height: 1.5; background-color: #fff; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            .header-logo { width: 40%; vertical-align: middle; }
            .header-logo img { max-width: 200px; height: auto; border-radius: 6px; }
            .header-dados { width: 60%; text-align: right; font-size: 13px; color: #555; }
            .header-dados h2 { margin: 0 0 5px 0; color: #2c3e50; font-size: 22px; }
            
            .titulo-doc { text-align: center; background: #2c3e50; color: white; padding: 10px; font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 25px; letter-spacing: 1px; }
            
            .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .info-box { border: 1px solid #ddd; padding: 15px; width: 50%; vertical-align: top; font-size: 14px; background: #fafafa; }
            .info-box h3 { margin: 0 0 8px 0; color: #2c3e50; font-size: 15px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
            
            .tabela-itens { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px; }
            .tabela-itens th { background: #34495e; color: white; padding: 12px; text-align: left; text-transform: uppercase; font-size: 12px; }
            .tabela-itens td { padding: 12px; border-bottom: 1px solid #eee; vertical-align: top; }
            
            .total-container { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }
            .total-box { border: 2px solid #2c3e50; background: #f4f6f7; padding: 15px; font-size: 15px; text-align: right; width: 50%; margin-left: auto; }
            .total-box .destaque-preco { font-size: 18px; font-weight: bold; color: #27ae60; border-top: 1px dashed #ccc; margin-top: 5px; padding-top: 5px; }
            
            .obs-box { border: 1px dashed #bbb; background: #fffcf5; padding: 15px; font-size: 13px; color: #666; margin-bottom: 50px; border-radius: 4px; }
            .obs-box h4 { margin: 0 0 5px 0; color: #c0392b; }
            
            .assinatura-container { width: 100%; margin-top: 60px; text-align: center; font-size: 14px; }
            .linha-assinatura { width: 250px; border-bottom: 1px solid #333; margin: 0 auto 5px auto; }
            
            @media print {
                .btn-imprimir { display: none !important; }
                body { padding: 0; }
            }
            .btn-imprimir { background: #27ae60; color: white; border: none; padding: 12px 25px; font-size: 16px; font-weight: bold; border-radius: 4px; cursor: pointer; display: block; margin: 0 auto 30px auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .btn-imprimir:hover { background: #219150; }
        </style>
    </head>
    <body>
        <button class="btn-imprimir" onclick="window.print()">📥 Imprimir / Salvar PDF</button>

        <table class="header-table">
            <tr>
                <td class="header-logo">
                    <img src="https://i.postimg.cc/7hvGT8cp/logo-sistema.jpg" alt="DPortas Logo">
                </td>
                <td class="header-dados">
                    <h2>DPORTAS AUTOMATIZAÇÕES</h2>
                    <strong>Portas de Aço Automáticas e Manuais</strong><br>
                    Instalação, Manutenção Preventiva e Corretiva<br>
                    Contato: (19) 99999-9999 | dportascontato@gmail.com<br>
                    Sumaré - SP e Região
                </td>
            </tr>
        </table>

        <div class="titulo-doc">Orçamento de Serviço nº ${numOrc}</div>

        <table class="info-grid">
            <tr>
                <td class="info-box" style="border-right: none;">
                    <h3>Dados do Cliente</h3>
                    <strong>Cliente:</strong> ${orc.cliente}<br>
                    <strong>Status:</strong> Aguardando Aprovação
                </td>
                <td class="info-box">
                    <h3>Informações da Proposta</h3>
                    <strong>Data de Emissão:</strong> ${orc.dataGerado}<br>
                    <strong>Validade da Proposta:</strong> 5 dias úteis
                </td>
            </tr>
        </table>

        <table class="tabela-itens">
            <thead>
                <tr>
                    <th style="width: 10%; text-align: center;">Qtd.</th>
                    <th style="width: 60%;">Descrição do Produto / Serviço</th>
                    <th style="width: 15%; text-align: right;">Val. Unitário</th>
                    <th style="width: 15%; text-align: right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center; font-weight: bold;">1</td>
                    <td style="white-space: pre-wrap;">${orc.descricao}</td>
                    <td style="text-align: right;">${valOriginalFmt}</td>
                    <td style="text-align: right;">${valOriginalFmt}</td>
                </tr>
            </tbody>
        </table>

        <table style="width: 100%;">
            <tr>
                <td style="width: 50%; vertical-align: top;">
                    <div style="font-size: 14px;">
                        <strong>Forma de Pagamento Selecionada:</strong><br>
                        🔹 ${orc.pagamento}
                    </div>
                </td>
                <td style="width: 50%; vertical-align: top;">
                    <table class="total-container">
                        <tr>
                            <td>
                                <div class="total-box">
                                    <div style="margin-bottom: 5px;">Subtotal: ${valOriginalFmt}</div>
                                    <div style="margin-bottom: 5px;">Descontos: ${orc.desconto ? "-5% Aplicado" : "R$ 0,00"}</div>
                                    <div class="destaque-preco">Valor Líquido: ${valFinalFmt}</div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <div class="obs-box">
            <h4>Observações Importantes:</h4>
            • Orçamento condicionado à visita técnica presencial para validação estrutural final.<br>
            • Instalações agendadas de segunda a sexta-feira em horário comercial padrão.<br>
            • Adequações estruturais do vão e ponto elétrico são de responsabilidade do cliente, exceto se especificado no orçamento.
        </div>

        <table class="assinatura-container">
            <tr>
                <td>
                    <div class="linha-assinatura"></div>
                    DPortas Portas de Aço
                </td>
                <td>
                    <div class="linha-assinatura"></div>
                    Aceite do Cliente (Assinatura/Data)
                </td>
            </tr>
        </table>
        
        <script>
            setTimeout(() => { window.print(); }, 800);
        </script>
    </body>
    </html>
    `);
    
    janelaPDF.document.close();
}

// --- 5. OUTRAS AÇÕES DOS BOTÕES ---
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

// --- 6. EVENTOS DE FORMULÁRIO ---
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

// ORÇAMENTO: SALVA E ABRE WHATSAPP IMEDIATAMENTE (O PDF FICA NO HISTÓRICO)
document.getElementById('formOrcamento').onsubmit = (e) => {
    e.preventDefault();
    
    let cliente = document.getElementById('orcCliente').value;
    let descricao = document.getElementById('orcDesc').value;
    let valorDigitado = document.getElementById('orcValor').value;
    
    let valorTratado = parseFloat(valorDigitado.replace(/\./g, '').replace(',', '.'));
    let formaPgto = document.getElementById('orcPagamento').value;

    if (isNaN(valorTratado)) {
        alert("Por favor, digite um valor válido. Exemplo: 1173 ou 1173,00");
        return;
    }

    let valorFinal = valorTratado;
    let msgDesconto = "";
    let teveDesconto = false;

    if (formaPgto === "Pix" || formaPgto === "Dinheiro") {
        valorFinal = valorTratado - (valorTratado * 0.05);
        msgDesconto = " *(5% de desconto já aplicado!)*";
        teveDesconto = true;
    }

    // Salva no banco de dados
    bd.orcamentos.push({
        cliente: cliente,
        descricao: descricao,
        valorOriginal: valorTratado,
        valor: valorFinal,
        pagamento: formaPgto,
        desconto: teveDesconto,
        dataGerado: new Date().toLocaleDateString('pt-BR')
    });
    salvarTudo(); 

    alert('✅ Orçamento salvo! Redirecionando para o WhatsApp...\nPara gerar o PDF, acesse a aba "Histórico".');

    // Abre o WhatsApp
    let valorFormatado = valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    let textoWpp = `*Orçamento - DPortas* 🚪\n\n👤 *Cliente:* ${cliente}\n🛠️ *Serviço:* ${descricao}\n💳 *Forma de Pagamento:* ${formaPgto}\n💰 *Valor Final:* ${valorFormatado}${msgDesconto}\n\nFicamos à disposição!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(textoWpp)}`, '_blank');
    
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
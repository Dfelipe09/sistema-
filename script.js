let opcao;
let clientes = [];
let estoque = [];
let orcamentos = [];
let ordensServico = [];
let agenda = [];

// 📱 TELEFONE DO SEU PAI CONFIGURADO
const TELEFONE_PAI = "19981376458"; 

do {
    opcao = Number(prompt(`SISTEMA DPORTAS\n
Escolha uma opção:
[1] Cadastrar Cliente
[2] Listar Clientes
[3] Cadastrar Produto no Estoque
[4] Listar Estoque
[5] Gerar Orçamento
[6] Listar Orçamentos Salvos
[7] Criar Ordem de Serviço
[8] Listar Ordens de Serviço
[9] Finalizar Ordem de Serviço
[10] Agendar Horário
[11] Listar Agenda
[12] Enviar Notificações (Cliente / Pai)
[13] Alertas de Manutenção Preventiva (A cada 4 meses)
[14] Alerta de Estoque Baixo
[0] Sair do Sistema`));

    if (isNaN(opcao)) {
        alert("Por favor, digite apenas números válidos.");
        continue;
    }

    switch (opcao) {
        case 1:
            let nomeCliente = prompt("Nome do Cliente:");
            let telCliente = prompt("Telefone do Cliente (com DDD, ex: 11999999999):");
            let ultimaVisita = prompt("Data do último serviço realizado (ex: 15/01/2026):");
            
            if (nomeCliente && telCliente && ultimaVisita) {
                let telLimpo = telCliente.replace(/\D/g, '');
                clientes.push({ 
                    nome: nomeCliente, 
                    telefone: telLimpo,
                    periodoMeses: 4, // FIXADO EM 4 MESES
                    ultimaVisita: ultimaVisita
                });
                alert(`Cliente ${nomeCliente} cadastrado! Preventiva sugerida a cada 4 meses.`);
            } else {
                alert("Cadastro cancelado. Preencha todos os dados corretamente.");
            }
            break;

        case 2:
            if (clientes.length === 0) {
                alert("Nenhum cliente cadastrado ainda.");
            } else {
                let listaClientes = "CLIENTES CADASTRADOS:\n\n";
                for (let i = 0; i < clientes.length; i++) {
                    listaClientes += `${i + 1}. ${clientes[i].nome} - Tel: ${clientes[i].telefone}\n   Manutenção a cada: ${clientes[i].periodoMeses} meses (Última: ${clientes[i].ultimaVisita})\n\n`;
                }
                alert(listaClientes);
            }
            break;

        case 3:
            let nomeProduto = prompt("Nome do Produto (ex: Bobina, Fechadura):");
            let qtdProduto = Number(prompt(`Quantidade de ${nomeProduto}:`));
            
            if (nomeProduto && !isNaN(qtdProduto)) {
                estoque.push({ produto: nomeProduto, quantidade: qtdProduto });
                alert(`${qtdProduto}x ${nomeProduto}(s) adicionado(s) ao estoque!`);
            } else {
                alert("Erro ao cadastrar produto. Verifique os dados inseridos.");
            }
            break;

        case 4:
            if (estoque.length === 0) {
                alert("O estoque está vazio.");
            } else {
                let listaEstoque = "ESTOQUE ATUAL:\n\n";
                for (let i = 0; i < estoque.length; i++) {
                    listaEstoque += `${i + 1}. ${estoque[i].produto} - Qtd: ${estoque[i].quantidade}\n`;
                }
                alert(listaEstoque);
            }
            break;

        case 5:
            let nomeParaOrcamento = prompt("Nome do Cliente para o Orçamento:");
            let servicoDescricao = prompt("Descrição do Serviço:");
            let valorServico = Number(prompt("Valor Total do Orçamento:"));

            if (nomeParaOrcamento && servicoDescricao && !isNaN(valorServico)) {
                orcamentos.push({ cliente: nomeParaOrcamento, descricao: servicoDescricao, valor: valorServico });
                let recibo = `==============================\n       ORÇAMENTO - DPORTAS      \n==============================\n\n👤 Cliente: ${nomeParaOrcamento}\n🛠️ Descrição: ${servicoDescricao}\n💰 Valor: R$ ${valorServico.toFixed(2)}\n\nGarantia de 90 dias.\n==============================`;
                alert(recibo);
            } else {
                alert("Erro ao gerar orçamento.");
            }
            break;

        case 6:
            if (orcamentos.length === 0) {
                alert("Nenhum orçamento cadastrado ainda.");
            } else {
                let listaOrcamentos = "ORÇAMENTOS SALVOS:\n\n";
                for (let i = 0; i < orcamentos.length; i++) {
                    listaOrcamentos += `${i + 1}. Cliente: ${orcamentos[i].cliente}\n   Descrição: ${orcamentos[i].descricao}\n   Valor: R$ ${orcamentos[i].valor.toFixed(2)}\n\n`;
                }
                alert(listaOrcamentos);
            }
            break;

        case 7:
            let clienteOS = prompt("Nome do Cliente para a Ordem de Serviço:");
            let descOS = prompt("Descrição detalhada do Serviço:");
            
            if (clienteOS && descOS) {
                ordensServico.push({ cliente: clienteOS, descricao: descOS, status: "Em andamento" });
                let comprovanteOS = `==============================\n   ORDEM DE SERVIÇO - DPORTAS   \n==============================\n\n👤 Cliente: ${clienteOS}\n🛠️ Serviço: ${descOS}\n\nStatus: Em andamento\n==============================`;
                alert(comprovanteOS);
            } else {
                alert("Erro ao criar Ordem de Serviço.");
            }
            break;

        case 8:
            if (ordensServico.length === 0) {
                alert("Nenhuma Ordem de Serviço cadastrada ainda.");
            } else {
                let listaOS = "ORDENS DE SERVIÇO:\n\n";
                for (let i = 0; i < ordensServico.length; i++) {
                    listaOS += `${i + 1}. Cliente: ${ordensServico[i].cliente}\n   Serviço: ${ordensServico[i].descricao}\n   Status: ${ordensServico[i].status}\n\n`;
                }
                alert(listaOS);
            }
            break;

        case 9:
            if (ordensServico.length === 0) {
                alert("Não há Ordens de Serviço cadastradas para finalizar.");
            } else {
                let listaParaFinalizar = "Escolha o número da O.S. que deseja finalizar:\n\n";
                for (let i = 0; i < ordensServico.length; i++) {
                    listaParaFinalizar += `[${i + 1}] Cliente: ${ordensServico[i].cliente} | Status: ${ordensServico[i].status}\n`;
                }
                let numeroOS = Number(prompt(listaParaFinalizar));
                let indice = numeroOS - 1;

                if (!isNaN(numeroOS) && indice >= 0 && indice < ordensServico.length) {
                    ordensServico[indice].status = "Concluída";
                    alert(`A O.S. do cliente ${ordensServico[indice].cliente} foi finalizada!`);
                } else {
                    alert("Número inválido.");
                }
            }
            break;

        case 10:
            let nomeAgenda = prompt("Nome do Cliente:");
            let dataAgenda = prompt("Data do Agendamento (ex: 25/05):");
            let horarioAgenda = prompt("Horário (ex: 14:00):");
            let servicoAgenda = prompt("Descrição do Serviço:");

            if (nomeAgenda && dataAgenda && horarioAgenda && servicoAgenda) {
                agenda.push({ cliente: nomeAgenda, data: dataAgenda, horario: horarioAgenda, servico: servicoAgenda });
                alert(`Agendado para ${nomeAgenda} no dia ${dataAgenda} às ${horarioAgenda}!`);
            } else {
                alert("Erro ao agendar.");
            }
            break;

        case 11:
            if (agenda.length === 0) {
                alert("A agenda está vazia.");
            } else {
                let listaAgenda = "COMPROMISSOS AGENDADOS:\n\n";
                for (let i = 0; i < agenda.length; i++) {
                    listaAgenda += `${i + 1}. Data: ${agenda[i].data} às ${agenda[i].horario}\n   Cliente: ${agenda[i].cliente}\n   Serviço: ${agenda[i].servico}\n\n`;
                }
                alert(listaAgenda);
            }
            break;

        case 12:
            if (agenda.length === 0) {
                alert("Não há agendamentos para notificar.");
            } else {
                let listaNotificar = "Selecione o agendamento para as notificações:\n\n";
                for (let i = 0; i < agenda.length; i++) {
                    listaNotificar += `[${i + 1}] Cliente: ${agenda[i].cliente} | Data: ${agenda[i].data} às ${agenda[i].horario}\n`;
                }
                let escolhaAgenda = Number(prompt(listaNotificar));
                let indiceAgenda = escolhaAgenda - 1;

                if (!isNaN(escolhaAgenda) && indiceAgenda >= 0 && indiceAgenda < agenda.length) {
                    let agendamentoSelecionado = agenda[indiceAgenda];
                    let clienteEncontrado = clientes.find(c => c.nome.toLowerCase() === agendamentoSelecionado.cliente.toLowerCase());
                    let telefoneCliente = clienteEncontrado ? clienteEncontrado.telefone : prompt("Digite o WhatsApp do cliente com DDD (apenas números):");

                    if (telefoneCliente) {
                        let msgCliente = `Olá, ${agendamentoSelecionado.cliente}! Confirmando seu agendamento na DPortas no dia ${agendamentoSelecionado.data} às ${agendamentoSelecionado.horario} para: ${agendamentoSelecionado.servico}.`;
                        window.open(`https://wa.me/55${telefoneCliente.replace(/\D/g, '')}?text=${encodeURIComponent(msgCliente)}`, '_blank');
                    }
                    if (TELEFONE_PAI) {
                        let msgPai = `📢 LEMBRETE DPORTAS\n\nFala, pai! Serviço agendado:\n👤 Cliente: ${agendamentoSelecionado.cliente}\n📅 Data: ${agendamentoSelecionado.data}\n⏰ Horário: ${agendamentoSelecionado.horario}\n🛠️ Serviço: ${agendamentoSelecionado.servico}`;
                        window.open(`https://wa.me/55${TELEFONE_PAI}?text=${encodeURIComponent(msgPai)}`, '_blank');
                    }
                }
            }
            break;

        case 13:
            if (clientes.length === 0) {
                alert("Nenhum cliente cadastrado.");
            } else {
                let listaPreventivas = "REVISÃO PREVENTIVA (RECOMENDADO A CADA 4 MESES):\n\nSelecione para cobrar via WhatsApp:\n\n";
                for (let i = 0; i < clientes.length; i++) {
                    listaPreventivas += `[${i + 1}] ${clientes[i].nome} (Última: ${clientes[i].ultimaVisita})\n`;
                }
                let escolhaPrev = Number(prompt(listaPreventivas));
                let indicePrev = escolhaPrev - 1;

                if (!isNaN(escolhaPrev) && indicePrev >= 0 && indicePrev < clientes.length) {
                    let clienteSel = clientes[indicePrev];
                    let msgPreventiva = `Olá, ${clienteSel.nome}! Faz cerca de 4 meses da nossa última manutenção (${clienteSel.ultimaVisita}). Que tal agendarmos uma preventiva esta semana para evitar problemas na sua porta?`;
                    window.open(`https://wa.me/55${clienteSel.telefone}?text=${encodeURIComponent(msgPreventiva)}`, '_blank');
                }
            }
            break;

        case 14:
            // LÓGICA DE ESTOQUE BAIXO
            if (estoque.length === 0) {
                alert("O estoque está completamente vazio.");
            } else {
                let estoqueBaixo = "⚠️ PRODUTOS ACABANDO (MENOS DE 5 UNIDADES):\n\n";
                let temBaixo = false;

                for (let i = 0; i < estoque.length; i++) {
                    if (estoque[i].quantidade < 5) {
                        estoqueBaixo += `• ${estoque[i].produto} | Restam apenas: ${estoque[i].quantidade} un.\n`;
                        temBaixo = true;
                    }
                }

                if (temBaixo) {
                    alert(estoqueBaixo);
                } else {
                    alert("Tudo sob controle! Nenhum produto com menos de 5 unidades.");
                }
            }
            break;

        case 0:
            alert("Encerrando o Sistema DPortas. Até logo!");
            break;

        default:
            alert("Opção inválida!");
            break;
    }

} while (opcao !== 0);
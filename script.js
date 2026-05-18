let opcao;
let clientes = [];
let estoque = [];
let orcamentos = [];
let ordensServico = [];

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
[0] Sair do Sistema`));

    if (isNaN(opcao)) {
        alert("Por favor, digite apenas números válidos.");
        continue;
    }

    switch (opcao) {
        case 1:
            let nomeCliente = prompt("Nome do Cliente:");
            let telCliente = prompt("Telefone do Cliente:");
            
            if (nomeCliente && telCliente) {
                clientes.push({ nome: nomeCliente, telefone: telCliente });
                alert(`Cliente ${nomeCliente} cadastrado com sucesso!`);
            } else {
                alert("Cadastro cancelado. Nome e telefone são obrigatórios.");
            }
            break;

        case 2:
            if (clientes.length === 0) {
                alert("Nenhum cliente cadastrado ainda.");
            } else {
                let listaClientes = "CLIENTES CADASTRADOS:\n\n";
                for (let i = 0; i < clientes.length; i++) {
                    listaClientes += `${i + 1}. ${clientes[i].nome} - Tel: ${clientes[i].telefone}\n`;
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
            let servicoDescricao = prompt("Descrição do Serviço (ex: Troca de molas e alinhamento):");
            let valorServico = Number(prompt("Valor Total do Orçamento (apenas números):"));

            if (nomeParaOrcamento && servicoDescricao && !isNaN(valorServico)) {
                orcamentos.push({ 
                    cliente: nomeParaOrcamento, 
                    descricao: servicoDescricao, 
                    valor: valorServico 
                });

                let recibo = `==============================\n`;
                recibo += `       ORÇAMENTO - DPORTAS      \n`;
                recibo += `==============================\n\n`;
                recibo += `👤 Cliente: ${nomeParaOrcamento}\n`;
                recibo += `🛠️ Descrição: ${servicoDescricao}\n`;
                recibo += `💰 Valor: R$ ${valorServico.toFixed(2)}\n\n`;
                recibo += `Garantia de serviço de 90 dias.\n`;
                recibo += `==============================`;

                alert(recibo);
            } else {
                alert("Erro ao gerar orçamento. Preencha todos os dados corretamente.");
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
            let descOS = prompt("Descrição detalhada do Serviço a ser feito:");
            
            if (clienteOS && descOS) {
                ordensServico.push({
                    cliente: clienteOS,
                    descricao: descOS
                });

                let comprovanteOS = `==============================\n`;
                comprovanteOS += `   ORDEM DE SERVIÇO - DPORTAS   \n`;
                comprovanteOS += `==============================\n\n`;
                comprovanteOS += `👤 Cliente: ${clienteOS}\n`;
                comprovanteOS += `🛠️ Descrição do Serviço: ${descOS}\n\n`;
                comprovanteOS += `Status: Em andamento\n`;
                comprovanteOS += `==============================`;

                alert(comprovanteOS);
            } else {
                alert("Erro ao criar Ordem de Serviço. O cliente e a descrição são obrigatórios.");
            }
            break;

        case 0:
            alert("Encerrando o Sistema DPortas. Até logo!");
            break;

        default:
            alert("Opção inválida! Escolha um número do menu.");
            break;
    }

} while (opcao !== 0);
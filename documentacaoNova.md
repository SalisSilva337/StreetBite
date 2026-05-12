Documento de Especificação Funcional: MVP - StreetBite
Data: 06 de Maio de 2026 Projeto: StreetBite (Sistema de PDV e Gestão para Food Trucks) Versão: 1.0 (MVP)
1. Justificativa
O mercado de food trucks e alimentação de rua carece de soluções tecnológicas acessíveis e adaptadas à sua realidade operacional. Sistemas tradicionais de PDV (Ponto de Venda) são caros, exigem hardware específico e possuem funcionalidades complexas (como integrações fiscais avançadas e controle de estoque em múltiplas camadas) que não agregam valor imediato a pequenos empreendedores. O StreetBite nasce da necessidade de prover um sistema de operação puramente essencial, de baixo custo e alta resiliência, focado na agilidade do atendimento de balcão.
2. Objetivo
Desenvolver o Produto Mínimo Viável (MVP) de uma aplicação web (PWA - Progressive Web App) focada no registro rápido de pedidos e gerenciamento básico de cardápio para food trucks. O sistema deve permitir um onboarding sem atritos (sem exigência imediata de dados fiscais) e prover uma interface de PDV otimizada para dispositivos móveis (tablets e smartphones).
3. Escopo
O que ESTÁ no escopo do MVP:
    • Gestão de Identidade: Cadastro simplificado de usuários (proprietários) e criação de perfis de negócios (Food Trucks) sob uma arquitetura multi-tenant (banco de dados único com isolamento lógico).
    • Gestão de Produtos (Cardápio): Criação, edição e exclusão lógica (soft delete) de itens do cardápio.
    • Ponto de Venda (PDV): Abertura de comandas, adição/remoção de produtos em tempo real e fechamento de pedidos.
    • Gestão de Pedidos: Visualização de pedidos ativos, filtragem por tipo (Delivery/Presencial) e atualização de status (Em aberto, Finalizado, Cancelado).
O que NÃO ESTÁ no escopo do MVP (Out of Scope):
    • Integração com gateways de pagamento ou maquininhas de cartão físicas.
    • Emissão de cupons fiscais (NFC-e/NF-e).
    • Controle de estoque e baixa de insumos (ex: contar pães ou gramas de carne).
    • Aplicativos nativos nas lojas (App Store/Google Play). A entrega será estritamente via Web/PWA.
    • Múltiplos perfis de acesso granulares (nesta fase, o login autenticado tem acesso total ao painel do food truck selecionado).
4. Premissas e Restrições
Premissas:
    • Os usuários utilizarão predominantemente redes móveis (3G/4G) que podem sofrer oscilações; a interface web deve ser responsiva e leve.
    • A confirmação de pagamentos será um processo estritamente manual e declarativo por parte do operador do caixa.
    • O modelo de banco de dados será monolítico, utilizando uma chave identificadora (ex: tenant_id ou food_truck_id) para separar os dados de cada cliente.
Restrições:
    • A infraestrutura em nuvem deve ser mantida com o menor custo possível (hospedagem VPS básica), inviabilizando instâncias dedicadas de banco de dados para cada cliente no momento.
    • A exclusão de produtos do cardápio não pode violar a integridade de dados de pedidos passados, sendo obrigatória a implementação de exclusão lógica.
5. Casos de Teste
Abaixo estão os casos de teste principais para validar os fluxos mapeados nos diagramas de processo.
CT01: Fluxo de Onboarding e Criação de Negócio
    • Pré-condição: Usuário não possui conta no sistema.
    • Passos:
        1. Acessar a Landing Page e iniciar o cadastro.
        2. Inserir dados básicos (Nome, E-mail, Senha) e validar o e-mail/celular.
        3. Selecionar o plano (Gratuito/Trial).
        4. Na tela subsequente, preencher Nome e Tipo de Comida do novo food truck.
        5. Clicar em Salvar.
    • Resultado Esperado: O sistema deve criar o usuário, associar o novo food truck a ele e redirecioná-lo imediatamente para a Tela Inicial (Dashboard/PDV) do food truck recém-criado, sem exigir login adicional.
CT02: Manutenção de Cardápio e Exclusão Lógica (Soft Delete)
    • Pré-condição: Usuário logado e na Página de Produtos. O produto "Hot Dog Simples" existe e já foi vendido em pedidos anteriores.
    • Passos:
        1. Selecionar o produto "Hot Dog Simples" e clicar em Excluir.
        2. Confirmar a exclusão.
        3. Retornar à Tela Inicial e abrir uma nova comanda.
        4. Acessar a Lista de Pedidos e visualizar um pedido antigo que continha o "Hot Dog Simples".
    • Resultado Esperado: O produto não deve mais aparecer na lista de itens disponíveis para novas comandas. No entanto, o pedido antigo na Lista de Pedidos deve continuar exibindo o "Hot Dog Simples" normalmente, sem quebra de dados. O registro no banco deve ter sido apenas inativado (ativo = false), não apagado.
CT03: Ciclo de Vida da Comanda e Adição Tardia ("A Coquinha")
    • Pré-condição: Usuário logado na Tela Inicial.
    • Passos:
        1. Clicar em "Fazer novo pedido" e gerar uma comanda.
        2. Adicionar 1x "Hambúrguer Clássico".
        3. Salvar/Minimizar a comanda (status Em Aberto).
        4. Acessar a "Lista de Pedidos" e filtrar por "Pedidos Ativos".
        5. Selecionar a comanda criada no passo 1 e clicar em "Modificar pedido".
        6. Adicionar 1x "Refrigerante Cola" à comanda e salvar.
    • Resultado Esperado: O sistema deve validar que o pedido está em aberto, permitir a adição do novo item e atualizar o valor total da comanda sem gerar um novo número de pedido.
CT04: Finalização e Pagamento Manual
    • Pré-condição: Comanda em aberto com itens adicionados.
    • Passos:
        1. Abrir a comanda ativa.
        2. Selecionar a opção de Finalizar.
        3. Escolher o método de pagamento (Dinheiro, PIX, Cartão).
        4. Confirmar o recebimento manualmente.
    • Resultado Esperado: O status da comanda deve mudar para "Pago/Finalizado", a comanda deve sair da visão de "Pedidos Ativos" e o fluxo deve retornar à Tela Inicial para o próximo cliente.
CT05: Loop de Cadastro de Produtos
    • Pré-condição: Usuário logado na Página de Produtos.
    • Passos:
        1. Clicar em "Criar novo produto".
        2. Preencher dados válidos e salvar.
        3. Na mensagem de sucesso, escolher a opção "Sim" para a pergunta "Deseja cadastrar novo produto?".
    • Resultado Esperado: O sistema deve limpar o formulário e manter o usuário na mesma tela para uma nova inserção, sem redirecioná-lo para a Tela Inicial ou Lista de Produtos.

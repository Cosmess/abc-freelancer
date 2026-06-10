# Flow Spec

## Cadastro

1. Usuario se cadastra.
2. Email precisa ser confirmado.
3. Perfil e completado depois do login.
4. Se o email estiver pendente, o acesso nao avanca para as areas internas.

## Vagas

1. Estabelecimento cria vaga.
2. Freelancer busca e filtra.
3. Freelancer se candidata.
4. Estabelecimento aceita ou recusa.
5. Se nao houver mais aceites, a vaga pode voltar para `OPEN`.
6. Se a vaga for encerrada ou excluida, ela nao deve mais aparecer na busca.

## Contato

- WhatsApp aparece apenas quando a regra de aceite permite.
- Mapas sempre apontam para o endereco da vaga.
- Mensagem do WhatsApp do freelancer usa nome do freelancer e titulo da vaga.
- Mensagem do WhatsApp do estabelecimento usa nome do estabelecimento, titulo, data, horario, endereco e valor.

## Assinatura

1. Usuario permanece em trial por 7 dias.
2. Quando o pagamento e aprovado, o trial termina na mesma data.
3. O plano pago passa a valer por 30 dias a partir da aprovacao.
4. Se houver renovacao antes da expiraçao, a nova contagem de 30 dias recomeça a partir do ultimo pagamento aprovado.
5. Na tela de plano, o usuario ve data do pagamento, inicio do plano, expiraçao e historico.

## Cancelamento e reembolso

1. O usuario pode cancelar a assinatura pelo painel.
2. Se o ultimo pagamento aprovado estiver dentro de 7 dias, o backend faz reembolso integral no Mercado Pago.
3. Nesse caso, o cancelamento encerra o acesso imediatamente no banco e o historico grava os dados do reembolso.
4. Se estiver fora da janela de 7 dias, o cancelamento segue sem reembolso e o acesso continua ate `currentPeriodEnd`.
5. A tela mostra "Assinatura cancelada" e os dias restantes ate o bloqueio quando ainda houver acesso valido.

## Midia

- Foto/logo pode ser enviada com ate 8 MB no navegador.
- O upload e comprimido antes de chegar no Supabase Storage.
- O campo salvo no banco e a URL publica da imagem.

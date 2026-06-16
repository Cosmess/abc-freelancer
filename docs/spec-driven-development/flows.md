# Flow Spec

## Cadastro

1. Usuario escolhe freelancer ou estabelecimento.
2. Usuario se cadastra por email/senha ou Google.
3. No cadastro por email/senha, a validacao acontece campo a campo no client e tambem no servidor.
4. Email precisa ser confirmado quando o cadastro usa email/senha.
5. No cadastro com Google, o role escolhido e enviado no callback e salvo antes da sincronizacao interna.
6. Perfil e completado depois do login.
7. Se o email estiver pendente, o acesso nao avanca para as areas internas.

## Recuperacao de senha

1. Usuario acessa `/auth/esqueci-senha`.
2. Supabase envia email de recuperacao com `redirectTo` para `/auth/recuperar-senha`.
3. `/auth/recuperar-senha` finaliza a sessao temporaria do link e redireciona para `/auth/nova-senha`.
4. Usuario define a nova senha.
5. Apos sucesso, o usuario e redirecionado para `/login`.

## Acesso por trial ou plano

1. Usuario permanece em trial por 7 dias.
2. Enquanto o trial esta ativo, pode acessar catalogos e areas operacionais do seu perfil.
3. Quando o trial expira sem assinatura ativa, as areas bloqueadas exibem mensagem com CTA para plano.
4. Estabelecimento sem acesso ativo nao ve catalogo de freelancers, vagas abertas nem gestao de vagas/candidatos.
5. Freelancer sem acesso ativo nao ve vagas abertas nem catalogo de estabelecimentos.
6. Server Actions sensiveis tambem validam acesso ativo antes de mutar dados.

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
- Preview de compartilhamento usa metadata Open Graph com `public/og-image.svg`.

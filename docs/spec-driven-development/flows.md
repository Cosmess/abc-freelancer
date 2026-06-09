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

## Midia

- Foto/logo pode ser enviada com ate 8 MB no navegador.
- O upload e comprimido antes de chegar no Supabase Storage.
- O campo salvo no banco e a URL publica da imagem.


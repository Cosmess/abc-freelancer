# Data Model Spec

## User

Vinculo com Supabase Auth e controle de trial.

Campos importantes:

- `supabaseAuthUserId`
- `name`
- `email`
- `phone`
- `role`
- `emailVerifiedAt`
- `trialStartsAt`
- `trialEndsAt`

Regra:

- O trial dura 7 dias a partir do cadastro.
- Quando um pagamento e aprovado, o trial termina na mesma data do pagamento.

## EstablishmentProfile

Perfil do estabelecimento, com endereco e `profilePhotoUrl`.

Campos importantes:

- `tradeName`
- `legalName`
- `whatsapp`
- `email`
- `type`
- `description`
- `profilePhotoUrl`
- `cep`
- `state`
- `city`
- `neighborhood`
- `street`
- `number`
- `complement`

## FreelancerProfile

Perfil do freelancer, com endereco, `profilePhotoUrl`, bio e experiencia.

Campos importantes:

- `fullName`
- `whatsapp`
- `email`
- `profilePhotoUrl`
- `city`
- `neighborhood`
- `street`
- `cep`
- `bio`
- `experience`

## Specialty

Catalogo de especialidades.

## FreelancerSpecialty

Ligacao entre freelancer e especialidade.

Regra:

- `unique(freelancerId, specialtyId)`

## Availability

Disponibilidade por dia e turno.

Turnos usados hoje:

- madrugada: `00:00-06:00`
- manha: `06:00-12:00`
- tarde: `12:00-18:00`
- noite: `18:00-23:59`

## JobPost

Vaga criada pelo estabelecimento.

Campos importantes:

- `title`
- `description`
- `specialtyId`
- `city`
- `neighborhood`
- `street`
- `number`
- `cep`
- `workDate`
- `startTime`
- `endTime`
- `paymentType`
- `paymentValue`
- `quantity`
- `requirements`
- `status`

## JobApplication

Candidatura do freelancer.

Campos importantes:

- `jobPostId`
- `freelancerId`
- `message`
- `status`
- `acceptedAt`
- `rejectedAt`

## Plan

Plano comercial por perfil.

Campos importantes:

- `role`
- `name`
- `description`
- `priceCents`
- `currency`
- `trialDays`
- `active`

## Subscription

Assinatura local do app, usada para controlar acesso, renovacao e cancelamento.

Campos importantes:

- `userId`
- `planId`
- `provider`
- `status`
- `mercadoPagoPreapprovalId`
- `mercadoPagoPreferenceId`
- `mercadoPagoPayerId`
- `startedAt`
- `trialEndsAt`
- `currentPeriodStart`
- `currentPeriodEnd`
- `cancelledAt`

Regras:

- Pagamento aprovado inicia um novo ciclo de 30 dias.
- Se houver renovacao antes da expiraçao, a contagem volta a partir do ultimo pagamento aprovado.
- Cancelamento nao remove o acesso imediato; o acesso segue ate `currentPeriodEnd`.
- Se o pagamento estiver dentro da janela de 7 dias, o cancelamento dispara reembolso integral.

## PaymentHistory

Historico de pagamentos e reembolsos do Mercado Pago.

Campos importantes:

- `mercadoPagoPaymentId`
- `mercadoPagoPreapprovalId`
- `status`
- `statusDetail`
- `amountCents`
- `currency`
- `paidAt`
- `mercadoPagoRefundId`
- `refundStatus`
- `refundAmountCents`
- `refundedAt`
- `payerEmail`

Regras:

- `paidAt` guarda a data de aprovacao do pagamento.
- `refundStatus` e `refundedAt` registram o reembolso quando existir.
- O historico da tela de plano exibe tanto o pagamento quanto o reembolso.

## Regras

- `unique(jobPostId, freelancerId)`
- CPF e CNPJ nao fazem parte do cadastro do produto.
- Vaga `OPEN` aparece na busca publica.
- Vaga `FINISHED` aparece como encerrada, nao como aberta.

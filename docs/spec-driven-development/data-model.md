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

## Regras

- `unique(jobPostId, freelancerId)`
- CPF e CNPJ nao fazem parte do cadastro do produto.
- Vaga `OPEN` aparece na busca publica.
- Vaga `FINISHED` aparece como encerrada, nao como aberta.

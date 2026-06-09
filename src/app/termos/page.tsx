import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Termos de Uso e Politica de Privacidade — ABC Freelancer",
  description:
    "Termos de Uso e Politica de Privacidade do ABC Freelancer, em conformidade com a Lei Geral de Protecao de Dados (LGPD — Lei 13.709/2018).",
};

const lastUpdate = "09 de junho de 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-5">
          <Link href="/" className="flex items-center gap-1.5 font-bold tracking-tight">
            <span className="text-primary">ABC</span>
            <span className="text-foreground">Freelancer</span>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-5 sm:py-14">
        {/* Title */}
        <div className="mb-10 flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Shield className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Termos de Uso e Politica de Privacidade
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ultima atualizacao: {lastUpdate} — Em conformidade com a{" "}
              <strong className="text-foreground">LGPD (Lei 13.709/2018)</strong>
            </p>
          </div>
        </div>

        <div className="grid gap-8 text-sm leading-7 text-muted-foreground">

          {/* 1 */}
          <Section title="1. Identificacao do Controlador">
            <p>
              O <strong className="text-foreground">ABC Freelancer</strong> e o controlador dos dados pessoais
              coletados por meio desta plataforma, operando como marketplace de conexao entre
              estabelecimentos comerciais e profissionais freelancers na regiao do ABCD Paulista (Santo Andre,
              Sao Bernardo do Campo, Sao Caetano do Sul, Diadema, Maua, Ribeirao Pires e Rio Grande da Serra).
            </p>
            <p>
              Para duvidas, solicitacoes ou exercicio de direitos previstos na LGPD, entre em contato pelo
              email: <strong className="text-foreground">privacidade@abcfreelancer.com.br</strong>
            </p>
          </Section>

          {/* 2 */}
          <Section title="2. Dados Coletados">
            <p>Coletamos os seguintes dados pessoais para operacao da plataforma:</p>
            <Subsection title="Para Freelancers">
              <ul className="ml-4 mt-2 grid gap-1 list-disc">
                <li>Nome completo</li>
                <li>Endereco de email</li>
                <li>Numero de telefone e WhatsApp</li>
                <li>Cidade e bairro de atuacao</li>
                <li>Foto de perfil (opcional)</li>
                <li>Biografia e experiencia profissional (opcional)</li>
                <li>Especialidades e disponibilidade de horarios</li>
                <li>Instagram (opcional)</li>
                <li>Data e hora de aceitacao destes Termos</li>
              </ul>
            </Subsection>
            <Subsection title="Para Estabelecimentos">
              <ul className="ml-4 mt-2 grid gap-1 list-disc">
                <li>Nome do responsavel</li>
                <li>Nome fantasia e razao social (opcional)</li>
                <li>Endereco de email</li>
                <li>Numero de telefone e WhatsApp</li>
                <li>Endereco completo do estabelecimento</li>
                <li>Tipo de estabelecimento e descricao (opcional)</li>
                <li>Foto ou logotipo (opcional)</li>
                <li>Instagram (opcional)</li>
                <li>Data e hora de aceitacao destes Termos</li>
              </ul>
            </Subsection>
            <p className="mt-3">
              Nao coletamos CPF, CNPJ, dados bancarios, documentos de identificacao ou qualquer
              dado sensivelcomo definido no Art. 5o, inciso II, da LGPD.
            </p>
          </Section>

          {/* 3 */}
          <Section title="3. Finalidade do Tratamento">
            <p>Seus dados sao tratados para as seguintes finalidades:</p>
            <ul className="ml-4 mt-2 grid gap-1.5 list-disc">
              <li>Criacao e gestao de conta na plataforma</li>
              <li>Conexao entre freelancers e estabelecimentos</li>
              <li>Exibicao de perfis no catalogo de profissionais e estabelecimentos</li>
              <li>Gestao de vagas e candidaturas</li>
              <li>Liberacao controlada de contato (WhatsApp/Instagram) apos aceite mutuo de candidatura</li>
              <li>Gestao de assinaturas e cobrancas via Mercado Pago</li>
              <li>Comunicacao sobre atualizacoes da plataforma</li>
              <li>Cumprimento de obrigacoes legais e regulatorias</li>
              <li>Prevencao a fraudes e garantia de seguranca</li>
            </ul>
          </Section>

          {/* 4 */}
          <Section title="4. Base Legal (Art. 7o e 11 da LGPD)">
            <p>O tratamento dos seus dados e realizado com base nas seguintes hipoteses legais:</p>
            <ul className="ml-4 mt-2 grid gap-1.5 list-disc">
              <li>
                <strong className="text-foreground">Consentimento (Art. 7o, I):</strong> Para coleta de dados
                opcionais como foto, bio, Instagram e disponibilidade de horarios.
              </li>
              <li>
                <strong className="text-foreground">Execucao de contrato (Art. 7o, V):</strong> Para dados
                necessarios ao funcionamento da plataforma, como nome, email e cidade.
              </li>
              <li>
                <strong className="text-foreground">Cumprimento de obrigacao legal (Art. 7o, II):</strong> Para
                registros obrigatorios exigidos por legislacao vigente.
              </li>
              <li>
                <strong className="text-foreground">Interesse legitimo (Art. 7o, IX):</strong> Para prevencao
                a fraudes, seguranca da plataforma e melhoria dos servicos.
              </li>
            </ul>
          </Section>

          {/* 5 */}
          <Section title="5. Compartilhamento de Dados">
            <p>Seus dados podem ser compartilhados nas seguintes situacoes:</p>
            <ul className="ml-4 mt-2 grid gap-1.5 list-disc">
              <li>
                <strong className="text-foreground">Entre usuarios da plataforma:</strong> O WhatsApp e o
                Instagram do freelancer sao exibidos ao estabelecimento somente apos aceite de candidatura.
                O WhatsApp e Instagram do estabelecimento sao exibidos ao freelancer somente apos o mesmo aceite.
              </li>
              <li>
                <strong className="text-foreground">Mercado Pago:</strong> Dados de email e identificacao de
                usuario sao compartilhados para processamento de pagamentos e assinaturas. O Mercado Pago
                possui politica de privacidade propria.
              </li>
              <li>
                <strong className="text-foreground">Supabase (infraestrutura):</strong> Provedor de banco de
                dados e autenticacao. Dados armazenados em servidores na regiao sa-east-1 (Sao Paulo, Brasil).
              </li>
              <li>
                <strong className="text-foreground">Obrigacao legal:</strong> Em cumprimento a ordem judicial
                ou determinacao de autoridade competente.
              </li>
            </ul>
            <p className="mt-3">
              Nao vendemos, alugamos ou comercializamos dados pessoais a terceiros.
            </p>
          </Section>

          {/* 6 */}
          <Section title="6. Retencao e Exclusao de Dados">
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessario para prestacao dos
              servicos. Apos o encerramento da conta:
            </p>
            <ul className="ml-4 mt-2 grid gap-1.5 list-disc">
              <li>Dados de perfil e candidaturas sao excluidos em ate 30 dias</li>
              <li>Registros financeiros e fiscais sao mantidos pelo prazo legal de 5 anos</li>
              <li>Logs de seguranca sao mantidos por 12 meses</li>
            </ul>
          </Section>

          {/* 7 */}
          <Section title="7. Seus Direitos como Titular (Art. 18 da LGPD)">
            <p>
              Voce tem os seguintes direitos em relacao aos seus dados pessoais, que podem ser exercidos
              mediante solicitacao ao email informado na secao 1:
            </p>
            <ul className="ml-4 mt-2 grid gap-2 list-disc">
              <li><strong className="text-foreground">Acesso:</strong> Confirmar a existencia e obter copia dos seus dados</li>
              <li><strong className="text-foreground">Correcao:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li><strong className="text-foreground">Anonimizacao:</strong> Anonimizar, bloquear ou eliminar dados desnecessarios</li>
              <li><strong className="text-foreground">Portabilidade:</strong> Solicitar seus dados em formato estruturado</li>
              <li><strong className="text-foreground">Eliminacao:</strong> Excluir dados tratados com base no consentimento</li>
              <li><strong className="text-foreground">Revogacao de consentimento:</strong> Retirar consentimento a qualquer momento</li>
              <li><strong className="text-foreground">Oposicao:</strong> Opor-se ao tratamento realizado com base em outras hipoteses legais</li>
              <li><strong className="text-foreground">Informacao:</strong> Ser informado sobre entidades publicas e privadas com as quais compartilhamos dados</li>
            </ul>
            <p className="mt-3">
              Respondemos solicitacoes em ate <strong className="text-foreground">15 dias uteis</strong>.
            </p>
          </Section>

          {/* 8 */}
          <Section title="8. Seguranca dos Dados">
            <p>
              Adotamos medidas tecnicas e administrativas para proteger seus dados, incluindo:
            </p>
            <ul className="ml-4 mt-2 grid gap-1.5 list-disc">
              <li>Comunicacao criptografada via HTTPS/TLS em todas as requisicoes</li>
              <li>Autenticacao gerenciada pela Supabase com verificacao de email obrigatoria</li>
              <li>Acesso aos dados restrito a usuarios autorizados com controles de role (perfil)</li>
              <li>Dados armazenados em infraestrutura com certificacoes de seguranca</li>
              <li>Monitoramento de acessos e eventos de seguranca</li>
              <li>Headers HTTP de seguranca (CSP, HSTS, X-Frame-Options)</li>
            </ul>
            <p className="mt-3">
              Em caso de incidente de seguranca que envolva risco relevante, notificaremos a Autoridade
              Nacional de Protecao de Dados (ANPD) e os titulares afetados no prazo previsto pela LGPD.
            </p>
          </Section>

          {/* 9 */}
          <Section title="9. Cookies e Dados de Navegacao">
            <p>
              Utilizamos cookies estritamente necessarios para autenticacao e manutencao de sessao.
              Nao utilizamos cookies de rastreamento, publicidade comportamental ou analytics de terceiros.
              Os cookies de sessao sao excluidos automaticamente ao sair da conta ou fechar o navegador.
            </p>
          </Section>

          {/* 10 */}
          <Section title="10. Transferencia Internacional">
            <p>
              Parte da infraestrutura opera em servidores localizados no Brasil (Supabase sa-east-1 — Sao Paulo).
              Eventuais transferencias internacionais de dados ocorrem apenas para provedores que oferecem
              nivel adequado de protecao, conforme Art. 33 da LGPD.
            </p>
          </Section>

          {/* 11 */}
          <Section title="11. Menores de Idade">
            <p>
              A plataforma e destinada exclusivamente a maiores de 18 anos. Nao coletamos
              intencionalmente dados de menores de idade. Caso identifiquemos coleta acidental de dados de
              menores, excluiremos tais informacoes imediatamente.
            </p>
          </Section>

          {/* 12 */}
          <Section title="12. Uso Aceitavel e Vedacoes">
            <p>Ao utilizar a plataforma, o usuario se compromete a:</p>
            <ul className="ml-4 mt-2 grid gap-1.5 list-disc">
              <li>Fornecer informacoes verdadeiras e atualizadas</li>
              <li>Nao utilizar a plataforma para atividades ilegais ou antiticas</li>
              <li>Nao tentar acessar dados de outros usuarios de forma nao autorizada</li>
              <li>Nao compartilhar credenciais de acesso com terceiros</li>
              <li>Respeitar os demais usuarios em todas as interacoes</li>
            </ul>
            <p className="mt-3">
              O descumprimento pode resultar em suspensao ou exclusao permanente da conta, sem
              prejuizo de outras medidas legais cabidas.
            </p>
          </Section>

          {/* 13 */}
          <Section title="13. Responsabilidade e Limitacao">
            <p>
              O ABC Freelancer atua como intermediador entre freelancers e estabelecimentos, nao sendo
              parte das relacoes de trabalho, servico ou contratacao estabelecidas entre eles. Nao nos
              responsabilizamos por acordos, pagamentos ou conflitos decorrentes das conexoes realizadas
              na plataforma.
            </p>
          </Section>

          {/* 14 */}
          <Section title="14. Alteracoes nos Termos">
            <p>
              Podemos atualizar estes Termos periodicamente. Notificaremos usuarios ativos por email
              sobre mudancas substanciais com pelo menos 30 dias de antecedencia. O uso continuado da
              plataforma apos o prazo de vigencia das mudancas constituira aceite dos novos termos.
              A data da ultima atualizacao e sempre indicada no inicio deste documento.
            </p>
          </Section>

          {/* 15 */}
          <Section title="15. Contato e Encarregado (DPO)">
            <p>
              Para exercer seus direitos, reportar incidentes de seguranca ou obter esclarecimentos:
            </p>
            <ul className="ml-4 mt-3 grid gap-1.5 list-disc">
              <li>
                <strong className="text-foreground">Email:</strong> privacidade@abcfreelancer.com.br
              </li>
              <li>
                <strong className="text-foreground">Assunto:</strong> LGPD — [descricao da solicitacao]
              </li>
              <li>
                <strong className="text-foreground">Prazo de resposta:</strong> ate 15 dias uteis
              </li>
            </ul>
            <p className="mt-3">
              Voce tambem pode registrar reclamacoes junto a{" "}
              <strong className="text-foreground">
                Autoridade Nacional de Protecao de Dados (ANPD)
              </strong>{" "}
              em gov.br/anpd.
            </p>
          </Section>

          {/* 16 */}
          <Section title="16. Legislacao e Foro">
            <p>
              Estes Termos sao regidos pela legislacao brasileira, em especial pela Lei Geral de Protecao
              de Dados Pessoais (LGPD — Lei 13.709/2018), pelo Codigo de Defesa do Consumidor (Lei 8.078/1990)
              e pelo Marco Civil da Internet (Lei 12.965/2014). Fica eleito o foro da Comarca de Santo Andre,
              Estado de Sao Paulo, para dirimir eventuais controversias.
            </p>
          </Section>

        </div>

        {/* Footer */}
        <div className="mt-12 rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Ao criar uma conta, voce confirma que leu, compreendeu e concordou integralmente com estes
            Termos de Uso e Politica de Privacidade, autorizando o tratamento dos seus dados conforme
            descrito acima.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            ABC Freelancer — ABCD Paulista, SP — {lastUpdate}
          </p>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-2">
      <h3 className="font-medium text-foreground">{title}</h3>
      {children}
    </div>
  );
}

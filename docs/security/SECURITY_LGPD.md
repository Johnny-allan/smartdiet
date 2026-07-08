# Seguranca e LGPD - SmartDiet

## Principios
O SmartDiet lida com dados pessoais e dados sensiveis de saude. Mesmo na Beta
gratuita, o projeto deve ser preparado para conformidade com LGPD.

## Beta inicial
- Pode nao ter login para facilitar testes locais.
- A arquitetura deve estar pronta para autenticacao futura.
- Dados demo nao devem conter pessoas reais.
- O endpoint `/api/v1/auth/session` retorna uma sessao Beta quando
  `AUTH_ENABLED=false`, sem exigir login.
- Quando `AUTH_ENABLED=true`, o contrato passa a sinalizar `auth_required` ate a
  implementacao do provedor real de identidade.

## Futuro obrigatorio
- Autenticacao.
- Autorizacao por papeis.
- Auditoria.
- Logs de acesso.
- Criptografia de dados sensiveis quando aplicavel.
- Politica de retencao de dados.
- Exportacao e exclusao de dados do paciente.

## Preparacao para autenticacao
- Manter o frontend consumindo `/auth/session` para descobrir estado de sessao.
- Introduzir tabelas futuras em schema `security`: users, roles, sessions,
  password_resets e audit_events.
- Usar hash forte para senhas se houver login proprio; preferir provedor OIDC
  em ambiente comercial.
- Separar permissoes por papel: nutritionist, clinic_admin e support_readonly.
- Nao ativar login real sem fluxo de recuperacao, expiracao de sessao e logs de
  auditoria.

## Regras para desenvolvimento
- Nao expor informacoes sensiveis em logs.
- Nao criar endpoints sem validacao.
- Nunca confiar em dados do frontend.
- Preparar `created_at`, `updated_at` e trilhas de auditoria em entidades
  criticas.

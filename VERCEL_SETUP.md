# 🚀 Configuração do Vercel - Horror Archive

Este guia explica como configurar as variáveis de ambiente no Vercel para o Horror Archive.

## ⚠️ IMPORTANTE - Erro de Deployment?

Se você está vendo este erro:
```
Environment Variable "TMDB_API_Key" references Secret "tmdb_api_key", which does not exist.
```

**Solução:**
1. Vá para: https://vercel.com/dashboard
2. Selecione o projeto **Horror-Archive**
3. Vá em **Settings** → **Environment Variables**
4. **Procure por `TMDB_API_Key`**
5. **Se existir, DELETE a variável** (clique nos 3 pontinhos → Delete)
6. **Adicione novamente** como descrito abaixo (SEM o símbolo @)
7. Faça redeploy do projeto

---

## 📋 Pré-requisitos

- Projeto Horror Archive já conectado ao Vercel
- Chave de API do TMDB (opcional, mas recomendado)

---

## 🔑 Obter Chave de API do TMDB (Grátis)

1. Acesse: https://www.themoviedb.org/
2. Crie uma conta (se ainda não tiver)
3. Vá para: **Configurações** → **API** → https://www.themoviedb.org/settings/api
4. Solicite uma chave de API (escolha "Developer" para uso pessoal)
5. Copie sua **API Key (v3 auth)**

---

## ⚙️ Configurar Variável de Ambiente no Vercel

### Opção 1: Via Dashboard do Vercel (Recomendado)

1. **Acesse seu projeto no Vercel:**
   - Vá para: https://vercel.com/dashboard
   - Selecione o projeto **Horror-Archive**

2. **Navegue até as Configurações:**
   - Clique em **Settings** (Configurações)
   - No menu lateral, clique em **Environment Variables**

3. **Adicione a variável TMDB_API_Key:**
   - **Name (Nome):** `TMDB_API_Key` (exatamente assim, com as maiúsculas)
   - **Value (Valor):** Cole sua chave de API do TMDB
     - **⚠️ IMPORTANTE:** Cole a chave DIRETAMENTE (exemplo: `a1b2c3d4e5f6...`)
     - **❌ NÃO use** `@tmdb_api_key` ou qualquer coisa com @ no início
     - **❌ NÃO use** aspas ou outros caracteres especiais
   - **Environment:** Selecione todas (Production, Preview, Development)
   - Clique em **Save**

4. **Redesploy o projeto:**
   - Vá para a aba **Deployments**
   - Clique nos 3 pontinhos (...) no último deployment
   - Selecione **Redeploy**
   - Marque **Use existing Build Cache** (opcional, para ser mais rápido)
   - Clique em **Redeploy**

### Opção 2: Via Vercel CLI

```bash
# Instale o Vercel CLI (se ainda não tiver)
npm i -g vercel

# Faça login
vercel login

# Adicione a variável de ambiente
vercel env add TMDB_API_Key

# Quando solicitado:
# - Value: Cole sua chave de API
# - Environments: Selecione todas (Production, Preview, Development)

# Redesploy
vercel --prod
```

---

## ✅ Verificar se Funcionou

Após o redeploy, você pode verificar se a chave foi configurada corretamente:

1. **Acesse o endpoint de health do seu addon:**
   ```
   https://seu-projeto.vercel.app/health
   ```

2. **Verifique os logs do Vercel:**
   - Vá para **Deployments**
   - Clique no deployment mais recente
   - Veja a aba **Runtime Logs**
   - Se houver erro relacionado ao TMDB, aparecerá aqui

3. **Teste os metadados:**
   - Acesse qualquer filme no Stremio
   - Se você ver informações de elenco, diretor e avaliações, a chave está funcionando! ✅

---

## 🔒 Segurança

**IMPORTANTE:**
- ✅ **NUNCA** commite o arquivo `.env` no Git
- ✅ O arquivo `.env` já está no `.gitignore`
- ✅ Use apenas variáveis de ambiente do Vercel para produção
- ✅ Não compartilhe sua chave de API publicamente

---

## 🆘 Problemas Comuns

### ❌ Erro: "Environment Variable 'TMDB_API_Key' references Secret 'tmdb_api_key', which does not exist"
**Este é o erro mais comum!**

**Causa:** Você (ou alguma configuração antiga) adicionou a variável com `@tmdb_api_key` como valor, em vez da chave real.

**Solução:**
1. Vá em **Settings** → **Environment Variables** no Vercel
2. **Encontre** `TMDB_API_Key`
3. **DELETE** a variável (clique nos 3 pontinhos → Delete)
4. **Adicione novamente:**
   - Name: `TMDB_API_Key`
   - Value: Sua chave real (exemplo: `a1b2c3d4e5f6g7h8...` - SEM @)
   - Environment: Todas
5. **Redeploy** o projeto
6. ✅ Deve funcionar agora!

**O que aconteceu:** O símbolo `@` indica ao Vercel que você quer usar um "Secret" (não uma variável comum). Como você não criou um Secret chamado "tmdb_api_key", dá erro. A solução é usar a chave diretamente como valor.

---

### Erro: "TMDB API Key not found"
**Solução:** 
- Verifique se o nome da variável é exatamente `TMDB_API_Key` (com maiúsculas/minúsculas corretas)
- Faça um redeploy após adicionar a variável

### Erro: "Invalid API Key"
**Solução:**
- Verifique se copiou a chave corretamente (sem espaços extras)
- Confirme que sua conta TMDB está ativa
- Certifique-se de usar a API Key v3, não v4

### Metadados não aparecem
**Solução:**
- O addon funciona SEM a chave TMDB, usando fontes alternativas
- Com a chave, você terá metadados mais ricos (elenco, diretor, etc.)
- Aguarde alguns minutos após o deploy para o cache limpar

---

## 📚 Mais Informações

- **Documentação do Vercel:** https://vercel.com/docs/concepts/projects/environment-variables
- **API do TMDB:** https://developers.themoviedb.org/3/getting-started/introduction
- **Horror Archive README:** [README.md](./README.md)

---

## ✨ Pronto!

Agora seu Horror Archive está configurado no Vercel com metadados aprimorados do TMDB! 🎬🩸

Se tiver dúvidas, abra uma [issue no GitHub](https://github.com/blaumath/Horror-Archive/issues).

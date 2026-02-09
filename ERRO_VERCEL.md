# ⚠️ ERRO DE DEPLOYMENT NO VERCEL? LEIA AQUI!

## 🚨 ATENÇÃO: AÇÃO MANUAL OBRIGATÓRIA

**O código do repositório está 100% correto ✅**

**O erro persiste porque existe uma variável configurada no VERCEL DASHBOARD que você precisa DELETAR MANUALMENTE.**

---

## Você está vendo este erro?

```
Environment Variable "TMDB_API_Key" references Secret "tmdb_api_key", which does not exist.
```

## ✅ SOLUÇÃO OBRIGATÓRIA (2 minutos)

### 🎯 O que você PRECISA fazer no Vercel Dashboard:

1. **Acesse:** https://vercel.com/blaumaths-projects/horror-archive/settings/environment-variables

2. **Encontre** a variável `TMDB_API_Key` na lista

3. **Delete** essa variável:
   - Clique nos **3 pontinhos (⋯)** ao lado
   - Clique em **Delete**
   - Confirme

4. **Redeploy:**
   - Vá em **Deployments**
   - Clique nos **3 pontinhos (⋯)** no último deployment
   - Clique em **Redeploy**

5. ✅ **Pronto!** Aguarde 2-3 minutos e o deploy funcionará.

---

## 🤔 Por que preciso fazer isso?

**Situação atual:**
- ✅ O `vercel.json` está correto (sem referência ao secret)
- ✅ O código está perfeito
- ❌ Mas existe uma variável no **Dashboard do Vercel** com valor `@tmdb_api_key`
- ❌ Isso causa erro porque o Secret `tmdb_api_key` não existe

**O código não pode deletar variáveis do Vercel Dashboard** - só você pode fazer isso!

---

## 📋 Passo a Passo Detalhado

### 1. Acesse Environment Variables

Link direto: https://vercel.com/blaumaths-projects/horror-archive/settings/environment-variables

Ou manualmente:
- Vá para https://vercel.com/dashboard
- Clique em **horror-archive**
- Clique em **Settings**
- No menu lateral: **Environment Variables**

### 2. Procure TMDB_API_Key

Na lista de variáveis, procure por:
- Nome: `TMDB_API_Key`
- Valor: `@tmdb_api_key` (é esse que está causando problema!)

### 3. Delete a variável

- Clique nos **3 pontinhos (⋯)** à direita da variável
- Selecione **Delete**
- Confirme a exclusão

### 4. Faça redeploy

- Vá para **Deployments** (no menu superior)
- Encontre o deployment mais recente (o que está com erro)
- Clique nos **3 pontinhos (⋯)** à direita
- Selecione **Redeploy**
- Aguarde 2-3 minutos

---

## ✅ Como saber se funcionou?

Após fazer redeploy:
1. O Vercel bot vai comentar no PR
2. Se der certo, vai aparecer ✅ (check verde)
3. Se ainda der erro, aparecer ❌ novamente

Se ainda der erro após deletar:
- Aguarde mais alguns minutos
- Tente limpar cache: Settings → Advanced → Clear Build Cache
- Faça outro redeploy

---

## 🔑 Quer adicionar a chave TMDB corretamente? (Opcional)

**A chave TMDB é OPCIONAL.** O addon funciona perfeitamente sem ela.

Se quiser metadados aprimorados (elenco, diretor, avaliações):

1. **Depois** de deletar e o deploy funcionar
2. Obtenha chave grátis: https://www.themoviedb.org/settings/api
3. No Vercel, clique **Add New** variable:
   - **Name:** `TMDB_API_Key`
   - **Value:** Sua chave REAL (ex: `a1b2c3d4e5f6...`)
     - ⚠️ **NÃO coloque** `@tmdb_api_key`
     - ⚠️ Cole a chave diretamente, sem @
   - **Environment:** Todas
4. **Save** e faça **Redeploy**

---

## 🚀 Resumo Executivo

| O que | Status |
|-------|--------|
| Código no GitHub | ✅ Correto |
| vercel.json | ✅ Correto |
| Documentação | ✅ Completa |
| **Variável no Vercel** | ❌ **Você precisa deletar** |
| **Redeploy** | ❌ **Você precisa fazer** |

**Tempo necessário:** 2 minutos
**Dificuldade:** Fácil - só seguir os passos

---

## 📚 Mais informações

- Guia completo: [VERCEL_SETUP.md](./VERCEL_SETUP.md)
- Instruções detalhadas: [README_FIRST.md](./README_FIRST.md)

---

**Link direto para Environment Variables:**
https://vercel.com/blaumaths-projects/horror-archive/settings/environment-variables

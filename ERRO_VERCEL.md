# ⚠️ ERRO DE DEPLOYMENT NO VERCEL? LEIA AQUI!

## Você está vendo este erro?

```
Environment Variable "TMDB_API_Key" references Secret "tmdb_api_key", which does not exist.
```

## ✅ SOLUÇÃO RÁPIDA (2 minutos)

### Passo 1: Acesse o Dashboard do Vercel
1. Vá para: https://vercel.com/dashboard
2. Clique no projeto **Horror-Archive**

### Passo 2: Deletar a Variável Problemática
1. Clique em **Settings** (no topo da página)
2. No menu lateral, clique em **Environment Variables**
3. Procure por `TMDB_API_Key`
4. Clique nos **3 pontinhos (⋯)** ao lado dela
5. Clique em **Delete**
6. Confirme a exclusão

### Passo 3: Adicionar Corretamente (se quiser metadados aprimorados)
A chave de API do TMDB é **OPCIONAL**. O addon funciona perfeitamente sem ela.

**Se quiser metadados aprimorados (elenco, diretor, avaliações):**

1. Obtenha uma chave grátis em: https://www.themoviedb.org/settings/api
2. No Vercel, clique em **Add New**
3. Preencha:
   - **Name:** `TMDB_API_Key`
   - **Value:** Cole sua chave **DIRETAMENTE** (exemplo: `a1b2c3d4e5f6...`)
     - ⚠️ **NÃO use** `@tmdb_api_key` - isso é um Secret, não a chave!
     - ⚠️ Cole apenas os caracteres da chave, sem espaços ou aspas
   - **Environment:** Selecione todas (Production, Preview, Development)
4. Clique em **Save**

### Passo 4: Redeploy
1. Vá para a aba **Deployments**
2. Clique nos **3 pontinhos (⋯)** no deployment mais recente
3. Clique em **Redeploy**
4. Aguarde alguns minutos

### ✅ Pronto!
O erro deve desaparecer e o deployment funcionará!

---

## 🤔 O que aconteceu?

O Vercel tem dois tipos de variáveis:
- **Variável de Ambiente**: Valor direto (exemplo: `abc123xyz`)
- **Secret**: Referência que começa com `@` (exemplo: `@meu_secret`)

Quando você coloca `@tmdb_api_key` como valor, o Vercel pensa que você quer usar um Secret chamado "tmdb_api_key". Como esse Secret não existe, dá erro.

A solução é colocar a chave **diretamente** como valor, sem o `@`.

---

## 📚 Mais Informações

Para guia completo com screenshots e outras opções, veja:
📖 **[VERCEL_SETUP.md](./VERCEL_SETUP.md)**

---

## 🆘 Ainda com problemas?

Abra uma [issue no GitHub](https://github.com/blaumath/Horror-Archive/issues) com:
- Print do erro
- Print da página Environment Variables
- Descrição do que você tentou

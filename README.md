Formulário com LocalStorage + Paginação

Aplicação front-end simples (HTML/CSS/JS puro) que realiza CRUD em localStorage e lista os registros com paginação configurável.

✨ Recursos

Criar, ler, atualizar e excluir usuários (CRUD) no localStorage.

Paginação com seletor de resultados por página (5, 10, 20, 50).

Carregar registro por ID.

Validação básica de campos (nome e e-mail).

UI responsiva e moderna.

Atalho: Enter no campo ID executa a busca.

🧱 Estrutura
/projeto
  ├── index.html        # Página principal
  ├── css/
  │     └── style.css   # Estilos
  └── js/
        └── app.js      # Lógica (CRUD + paginação)

🚀 Como executar

Baixe os três arquivos acima (mantendo a estrutura de pastas).

Abra o index.html diretamente no navegador (duplo clique) – não precisa de servidor.

Opcional: sirva com um estático, ex.:

# Node
npx serve .
# ou Python 3
python -m http.server 8080


Crie alguns registros e teste a paginação.

🕹️ Como usar

Criar: preencha o formulário e clique Criar. O ID é atribuído automaticamente.

Carregar por ID: informe um ID e clique Carregar (ou Enter).

Salvar (atualizar): com um ID carregado, altere campos e clique Salvar.

Excluir: informe/carregue um ID e clique Excluir.

Paginação: ajuste “Resultados por página” e navegue com Anterior / Próxima.

Limpar formulário: botão Limpar.

💾 Armazenamento

Chaves do localStorage:

users — array de usuários.

users_seq — sequência numérica para gerar o próximo id.

Modelo de dado (exemplo)
{
  "id": 3,
  "name": "Alice",
  "username": "alice",
  "email": "alice@exemplo.com",
  "phone": "(00) 00000-0000",
  "website": "https://exemplo.com",
  "company": { "name": "Empresa X" }
}

🔧 Configurações úteis

Pré-popular dados (demo): no app.js, dentro de ensureInit(), há um bloco comentado para inserir exemplos. Basta descomentar para ver a paginação em ação.

Tamanho padrão da página: controlado pelo <select id="pageSize"> no index.html (padrão 10).

Alterar campos: adicione inputs no index.html e reflita no getFormData() / setFormData() no app.js.

🧹 Resetar dados

Para “zerar” a aplicação, no console do navegador você pode rodar:

localStorage.removeItem('users');
localStorage.removeItem('users_seq');


ou simplesmente:

localStorage.clear();

❗ Dicas & Solução de Problemas

“Nenhum registro.” na tabela: crie itens ou habilite o pré-populate.

Validação de e-mail: é básica (regex simples). Ajuste conforme sua regra.

Persistência: o localStorage é por navegador/origem. Em outro browser ou em aba anônima os dados não aparecem.

🗺️ Próximos passos (ideias)

Busca e ordenação por coluna.

Exportar CSV / Importar JSON.

Máscaras (telefone), validação mais robusta e mensagens por campo.

Temas claro/escuro.

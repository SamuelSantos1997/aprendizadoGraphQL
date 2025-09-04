// ===== Config =====
const STORAGE_KEY = 'users';
const SEQ_KEY = 'users_seq';

// ===== Utils básicos =====
const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));
const statusEl = () => qs('#status');

const setStatus = (msg = '', loading = false) => {
  if (!msg) { statusEl().textContent = ''; return; }
  statusEl().innerHTML = loading ? `<span class="spinner"></span>${msg}` : msg;
};

const loadUsers = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const saveUsers = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
const getSeq = () => parseInt(localStorage.getItem(SEQ_KEY) || '1', 10);
const setSeq = (n) => localStorage.setItem(SEQ_KEY, String(n));

function ensureInit() {
  if (localStorage.getItem(STORAGE_KEY) == null) saveUsers([]);
  if (localStorage.getItem(SEQ_KEY) == null) setSeq(1);

  // (Opcional) Popular com alguns exemplos na primeira vez:
  // if (loadUsers().length === 0) {
  //   ['Alice','Bruno','Carla','Diego','Eva','Fabio','Gi','Helena','Igor','Júlia','Kauê','Lia'].forEach((nome,i)=>{
  //     createUser({name:nome, username:`user${i+1}`, email:`${nome.toLowerCase()}@exemplo.com`, phone:'(00) 00000-0000', website:'https://exemplo.com', company:{name:'Empresa X'}}, false);
  //   });
  //   render();
  // }
}

// ===== Estado da lista/paginação =====
let currentPage = 1;
let pageSize = parseInt(qs('#pageSize')?.value || '10', 10);

// ===== Form helpers =====
function getFormData() {
  return {
    name: qs('#name').value.trim(),
    username: qs('#username').value.trim(),
    email: qs('#email').value.trim(),
    phone: qs('#phone').value.trim(),
    website: qs('#website').value.trim(),
    company: { name: qs('#company').value.trim() }
  };
}

function setFormData(data = {}) {
  qs('#name').value = data.name ?? '';
  qs('#username').value = data.username ?? '';
  qs('#email').value = data.email ?? '';
  qs('#phone').value = data.phone ?? '';
  qs('#website').value = data.website ?? '';
  qs('#company').value = data.company?.name ?? '';
}

function clearForm() {
  qs('#userId').value = '';
  setFormData({});
  setStatus('Formulário limpo.');
}

function validateForm() {
  const { name, email } = getFormData();
  if (!name) return 'Informe o nome.';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return 'Informe um e-mail válido.';
  return null;
}

// ===== CRUD no localStorage =====
function createUser(userData, shouldRender = true) {
  const users = loadUsers();
  const id = getSeq();
  setSeq(id + 1);
  const newUser = { id, ...userData };
  users.push(newUser);
  saveUsers(users);
  if (shouldRender) render();
  return newUser;
}

function updateUser(id, userData) {
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  users[idx] = { ...users[idx], ...userData };
  saveUsers(users);
  return true;
}

function deleteUser(id) {
  let users = loadUsers();
  const before = users.length;
  users = users.filter(u => u.id !== id);
  saveUsers(users);
  return users.length < before;
}

function getUserById(id) {
  return loadUsers().find(u => u.id === id) || null;
}

// ===== Render da tabela + paginação =====
function getPagedUsers() {
  const users = loadUsers();
  const total = users.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const slice = users.slice(start, end);

  return { slice, total, totalPages };
}

function renderTable() {
  const { slice } = getPagedUsers();
  const tbody = qs('#tblUsers tbody');
  tbody.innerHTML = '';

  if (slice.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 8;
    td.textContent = 'Nenhum registro.';
    td.style.color = '#94a3b8';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  for (const u of slice) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.name ?? ''}</td>
      <td>${u.username ?? ''}</td>
      <td>${u.email ?? ''}</td>
      <td>${u.phone ?? ''}</td>
      <td>${u.website ?? ''}</td>
      <td>${u.company?.name ?? ''}</td>
      <td>
        <div style="display:flex; gap:8px;">
          <button class="ghost btn-edt" data-id="${u.id}">Editar</button>
          <button class="danger btn-del" data-id="${u.id}">Excluir</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  // ações linha
  qsa('.btn-edt').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      const u = getUserById(id);
      if (!u) return;
      qs('#userId').value = String(u.id);
      setFormData(u);
      setStatus(`Carregado para edição (#${id}).`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  qsa('.btn-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      if (!confirm(`Excluir registro #${id}?`)) return;
      const ok = deleteUser(id);
      if (ok) {
        // Se excluiu o último item da última página, volte uma página
        const { total, totalPages } = getPagedUsers();
        if (total === 0) currentPage = 1;
        else if (currentPage > totalPages) currentPage = totalPages;
        render();
        setStatus(`Registro #${id} excluído.`);
      } else {
        setStatus('Não foi possível excluir.');
      }
    });
  });
}

function renderPagination() {
  const { total, totalPages } = getPagedUsers();
  qs('#pageInfo').textContent = `Página ${currentPage} de ${totalPages} — ${total} registro(s)`;
  qs('#btnPrev').disabled = currentPage <= 1;
  qs('#btnNext').disabled = currentPage >= totalPages;
}

function render() {
  renderTable();
  renderPagination();
}

// ===== Handlers Botões =====
async function onLoadById() {
  const id = parseInt(qs('#userId').value.trim(), 10);
  if (!id) { setStatus('Informe um ID para carregar.'); return; }
  const u = getUserById(id);
  if (!u) { setStatus('Usuário não encontrado.'); setFormData({}); return; }
  setFormData(u);
  setStatus(`Usuário #${id} carregado.`);
}

function onCreate() {
  const err = validateForm();
  if (err) { setStatus(err); return; }
  const u = createUser(getFormData());
  qs('#userId').value = String(u.id);
  setStatus(`Criado com sucesso. ID: ${u.id}`);
}

function onSave() {
  const id = parseInt(qs('#userId').value.trim(), 10);
  if (!id) { setStatus('Informe o ID para salvar.'); return; }
  const err = validateForm();
  if (err) { setStatus(err); return; }
  const ok = updateUser(id, getFormData());
  if (ok) { render(); setStatus(`Usuário #${id} salvo.`); }
  else setStatus('Não foi possível salvar. ID inexistente.');
}

function onDelete() {
  const id = parseInt(qs('#userId').value.trim(), 10);
  if (!id) { setStatus('Informe o ID para excluir.'); return; }
  if (!confirm(`Confirma excluir o registro #${id}?`)) return;
  const ok = deleteUser(id);
  if (ok) {
    clearForm();
    render();
    setStatus(`Registro #${id} excluído.`);
  } else {
    setStatus('Não foi possível excluir. ID inexistente.');
  }
}

// ===== Navegação paginação =====
function prevPage() { if (currentPage > 1) { currentPage--; render(); } }
function nextPage() {
  const { totalPages } = getPagedUsers();
  if (currentPage < totalPages) { currentPage++; render(); }
}

// ===== Boot =====
ensureInit();
render();

// Eventos
qs('#btnLoad').addEventListener('click', onLoadById);
qs('#btnCreate').addEventListener('click', onCreate);
qs('#btnSave').addEventListener('click', onSave);
qs('#btnDelete').addEventListener('click', onDelete);
qs('#btnClear').addEventListener('click', clearForm);

qs('#btnPrev').addEventListener('click', prevPage);
qs('#btnNext').addEventListener('click', nextPage);
qs('#pageSize').addEventListener('change', (e) => {
  pageSize = parseInt(e.target.value, 10);
  currentPage = 1; // volta para a primeira página ao mudar o tamanho
  render();
});

// Enter no campo ID para buscar
qs('#userId').addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); onLoadById(); }});

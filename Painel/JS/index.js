// ======= CONFIGURE AQUI SUA API =======
// Exemplo público (somente teste): https://jsonplaceholder.typicode.com
const API_BASE = 'https://jsonplaceholder.typicode.com'; // troque para sua API
const RESOURCE = 'users';

// ======= HELPERS =======
const qs = (sel) => document.querySelector(sel);
const setLoading = (loading, msg = 'Carregando...') => {
    const status = qs('#status');
    if (loading) {
    status.innerHTML = `<span class="spinner"></span>${msg}`;
    } else {
    if (!msg) status.textContent = '';
    else status.textContent = msg;
    }
    // Desabilitar botões durante chamadas
    ['#btnLoad','#btnSave','#btnCreate','#btnDelete','#btnClear'].forEach(id=>{
    const el = qs(id); if (el) el.disabled = loading;
    });
};

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
    setLoading(false, 'Formulário limpo.');
}

function validateForm() {
    const { name, email } = getFormData();
    if (!name) return 'Informe o nome.';
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return 'Informe um e-mail válido.';
    return null;
}

// ======= CRUD REST =======
async function loadById() {
    const id = qs('#userId').value.trim();
    if (!id) { setLoading(false, 'Informe um ID para carregar.'); return; }
    try {
    setLoading(true, 'Buscando usuário...');
    const res = await fetch(`${API_BASE}/${RESOURCE}/${id}`);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    const data = await res.json();
    setFormData(data);
    setLoading(false, `Usuário #${id} carregado.`);
    } catch (err) {
    console.error(err);
    setLoading(false, 'Não foi possível carregar. Verifique o ID/servidor.');
    }
}

async function createItem() {
    const err = validateForm();
    if (err) { setLoading(false, err); return; }
    try {
    setLoading(true, 'Enviando (POST)...');
    const res = await fetch(`${API_BASE}/${RESOURCE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getFormData())
    });
    const data = await res.json();
    // Em APIs reais, 'data.id' vem do backend
    qs('#userId').value = data.id || '';
    setLoading(false, `Criado com sucesso. ID: ${data.id ?? '(retorno simulado)'}`);
    } catch (e) {
    console.error(e);
    setLoading(false, 'Falha ao criar. Veja o console.');
    }
}

async function saveItem() {
    const id = qs('#userId').value.trim();
    if (!id) { setLoading(false, 'Informe o ID para salvar (PUT).'); return; }
    const err = validateForm();
    if (err) { setLoading(false, err); return; }
    try {
    setLoading(true, `Salvando #${id} (PUT)...`);
    const res = await fetch(`${API_BASE}/${RESOURCE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getFormData())
    });
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    const data = await res.json();
    setFormData(data);
    setLoading(false, `Usuário #${id} salvo.`);
    } catch (e) {
    console.error(e);
    setLoading(false, 'Falha ao salvar. Veja o console.');
    }
}

async function deleteItem() {
    const id = qs('#userId').value.trim();
    if (!id) { setLoading(false, 'Informe o ID para excluir.'); return; }
    if (!confirm(`Confirma excluir o registro #${id}?`)) return;
    try {
    setLoading(true, `Excluindo #${id} (DELETE)...`);
    const res = await fetch(`${API_BASE}/${RESOURCE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    clearForm();
    setLoading(false, `Registro #${id} excluído (em APIs de teste, a exclusão é simulada).`);
    } catch (e) {
    console.error(e);
    setLoading(false, 'Falha ao excluir. Veja o console.');
    }
}

// ======= Eventos =======
qs('#btnLoad').addEventListener('click', loadById);
qs('#btnCreate').addEventListener('click', createItem);
qs('#btnSave').addEventListener('click', saveItem);
qs('#btnDelete').addEventListener('click', deleteItem);
qs('#btnClear').addEventListener('click', clearForm);

// Atalho: Enter no campo ID faz buscar
qs('#userId').addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); loadById(); }});

// Mensagem inicial
setLoading(false, 'Pronto para uso. Carregue por ID ou crie um novo.');
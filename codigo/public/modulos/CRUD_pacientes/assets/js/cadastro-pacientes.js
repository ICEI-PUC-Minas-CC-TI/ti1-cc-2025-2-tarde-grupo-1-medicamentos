
const API_URL = '';

let pacientes = [];
let editandoId = null;
let processandoCadastro = false;

document.addEventListener('DOMContentLoaded', () => {
    inicializarPagina();
});

function inicializarPagina() {
    carregarPacientes();
    configurarEventos();
    iniciarMenuMobile();
}

function configurarEventos() {

    const btnInserir = document.getElementById('btn-inserir');
    const btnAtualizar = document.getElementById('btn-atualizar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnVoltar = document.getElementById('btn-voltar');
    const form = document.getElementById('form-paciente');
    const contatoInput = document.getElementById('contato');

    btnInserir?.addEventListener('click', inserirPaciente);
    btnAtualizar?.addEventListener('click', atualizarPaciente);
    btnCancelar?.addEventListener('click', cancelarEdicao);
    if (btnVoltar) btnVoltar.addEventListener('click', voltarParaHome);

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            return false;
        });
    }

    if (contatoInput) {
        contatoInput.addEventListener('input', aplicarMascaraTelefone);
    }

    const inputPesquisa = document.getElementById('input-pesquisa-pacientes');
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroIdade = document.getElementById('filtro-idade');
    const selectOrdenacao = document.getElementById('ordenacao');

    if (inputPesquisa) {
        inputPesquisa.addEventListener('input', exibirPacientes);
    }

    if (filtroTipo) filtroTipo.addEventListener('change', exibirPacientes);
    if (filtroIdade) filtroIdade.addEventListener('change', exibirPacientes);
    if (selectOrdenacao) selectOrdenacao.addEventListener('change', exibirPacientes);
}

function iniciarMenuMobile() {
    const btnHamburger = document.getElementById('btn-hamburger');
    const btnFechar = document.querySelector('.btn-fechar-menu-mobile');
    const navMenu = document.getElementById('nav-menu');

    if (btnHamburger && navMenu) {
        btnHamburger.addEventListener('click', () => navMenu.classList.add('menu-aberto'));
    }

    if (btnFechar && navMenu) {
        btnFechar.addEventListener('click', () => navMenu.classList.remove('menu-aberto'));
    }

    if (navMenu) {
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => navMenu.classList.remove('menu-aberto'));
        });
    }
}


async function inserirPaciente() {
    if (processandoCadastro) return;
    if (!validarFormulario()) return;

    processandoCadastro = true;
    const btnInserir = document.getElementById('btn-inserir');
    btnInserir.textContent = 'Cadastrando...';
    btnInserir.disabled = true;

    const paciente = {
        nome: document.getElementById('nome').value.trim(),
        idade: parseInt(document.getElementById('idade').value),
        contato: document.getElementById('contato').value.trim(),
        tipo: document.getElementById('tipo').value,
        dataCadastro: new Date().toISOString(),
        ativo: true
    };

    try {
        const response = await fetch(`${API_URL}/pacientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paciente)
        });

        if (response.ok) {
            mostrarMensagem('Paciente cadastrado!', 'success');
            await carregarPacientes();
            limparFormulario();
        } else {
            throw new Error('Erro na API');
        }
    } catch (error) {
        console.error(error);
        mostrarMensagem('Erro ao cadastrar.', 'error');
    } finally {
        processandoCadastro = false;
        btnInserir.textContent = 'Cadastrar';
        btnInserir.disabled = false;
    }
}

async function carregarPacientes() {
    try {
        const response = await fetch(`${API_URL}/pacientes`);
        if (response.ok) {
            pacientes = await response.json();
            exibirPacientes();
        }
    } catch (error) {
        console.error(error);
        const lista = document.getElementById('lista-pacientes');
        if (lista) lista.innerHTML = '<div class="lista-vazia">❌ Erro de conexão com localhost:3000</div>';
    }
}

async function atualizarPaciente() {
    if (processandoCadastro || !editandoId) return;
    if (!validarFormulario()) return;

    const btnAtualizar = document.getElementById('btn-atualizar');
    btnAtualizar.textContent = 'Salvando...';
    processandoCadastro = true;

    const paciente = {
        nome: document.getElementById('nome').value.trim(),
        idade: parseInt(document.getElementById('idade').value),
        contato: document.getElementById('contato').value.trim(),
        tipo: document.getElementById('tipo').value,
        dataCadastro: new Date().toISOString() 
    };

    try {
        const response = await fetch(`${API_URL}/pacientes/${editandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paciente)
        });

        if (response.ok) {
            mostrarMensagem('Atualizado com sucesso!', 'success');
            await carregarPacientes();
            cancelarEdicao();
        }
    } catch (error) {
        mostrarMensagem('Erro ao atualizar', 'error');
    } finally {
        processandoCadastro = false;
        btnAtualizar.textContent = 'Atualizar';
    }
}

async function excluirPaciente(id) {
    if (!confirm('Deseja realmente excluir este paciente?')) return;

    try {
        await fetch(`${API_URL}/pacientes/${id}`, { method: 'DELETE' });
        mostrarMensagem('Excluído com sucesso', 'success');
        carregarPacientes();
    } catch (error) {
        mostrarMensagem('Erro ao excluir', 'error');
    }
}



function exibirPacientes() {
    let lista = [...pacientes];

    const inputPesquisa = document.getElementById('input-pesquisa-pacientes');
    const termoPesquisa = inputPesquisa ? inputPesquisa.value.toLowerCase() : '';

    const filtroTipo = document.getElementById('filtro-tipo');
    const valorTipo = filtroTipo ? filtroTipo.value : '';

    const filtroIdade = document.getElementById('filtro-idade');
    const valorIdade = filtroIdade ? filtroIdade.value : '';

    const ordenacao = document.getElementById('ordenacao');
    const criterioOrdenacao = ordenacao ? ordenacao.value : 'nome';


    if (termoPesquisa) {
        lista = lista.filter(paciente =>
            paciente.nome.toLowerCase().includes(termoPesquisa)
        );
    } 

    if (valorTipo) {
        lista = lista.filter(p => p.tipo === valorTipo);
    }


    if (valorIdade) {
        lista = lista.filter(p => {
            const i = p.idade;
            if (valorIdade === 'crianca') return i <= 12;
            if (valorIdade === 'adolescente') return i > 12 && i < 18;
            if (valorIdade === 'adulto') return i >= 18 && i < 60;
            if (valorIdade === 'idoso') return i >= 60;
            return true;
        });
    }


    lista.sort((a, b) => {
        if (criterioOrdenacao === 'idade') return a.idade - b.idade;
        if (criterioOrdenacao === 'tipo') return a.tipo.localeCompare(b.tipo);
        return a.nome.localeCompare(b.nome);
    });

    const container = document.getElementById('lista-pacientes');
    const contador = document.getElementById('contador-pacientes');

    if (contador) contador.textContent = `(${lista.length})`;

    if (lista.length === 0) {
        container.innerHTML = '<div class="lista-vazia">Nenhum registro encontrado.</div>';
        return;
    }

    container.innerHTML = lista.map(p => `
        <div class="paciente-card">
            <div class="paciente-header">
                <h3>${p.nome}</h3>
                <div class="paciente-actions">
                    <button onclick="editarPaciente('${p.id}')" class="btn-icon btn-edit" title="Editar">✏️</button>
                    <button onclick="excluirPaciente('${p.id}')" class="btn-icon btn-delete" title="Excluir">🗑️</button>
                </div>
            </div>
            <div class="paciente-details">
                <span class="info-item">🎂 <strong>${p.idade}</strong> anos</span>
                <span class="info-item">📞 ${p.contato}</span>
                <span class="info-item">👤 ${p.tipo.toUpperCase()}</span>
            </div>
        </div>
    `).join('');
}

window.editarPaciente = function (id) {
    const paciente = pacientes.find(p => p.id == id);
    if (!paciente) return;

    editandoId = id;
    document.getElementById('nome').value = paciente.nome;
    document.getElementById('idade').value = paciente.idade;
    document.getElementById('contato').value = paciente.contato;
    document.getElementById('tipo').value = paciente.tipo;
    document.getElementById('paciente-id').value = id;

    document.getElementById('btn-inserir').style.display = 'none';
    document.getElementById('btn-atualizar').style.display = 'inline-block';
    document.getElementById('btn-cancelar').style.display = 'inline-block';

    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
};

window.excluirPaciente = excluirPaciente;

function cancelarEdicao() {
    editandoId = null;
    limparFormulario();
    document.getElementById('btn-inserir').style.display = 'inline-block';
    document.getElementById('btn-atualizar').style.display = 'none';
    document.getElementById('btn-cancelar').style.display = 'none';
}

function limparFormulario() {
    document.getElementById('form-paciente').reset();
}

function validarFormulario() {
    const nome = document.getElementById('nome').value;
    const idade = document.getElementById('idade').value;
    const contato = document.getElementById('contato').value;
    const tipo = document.getElementById('tipo').value;

    if (!nome || !idade || !contato || !tipo) {
        mostrarMensagem('Preencha todos os campos!', 'error');
        return false;
    }
    return true;
}

function aplicarMascaraTelefone(e) {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    e.target.value = v;
}

function voltarParaHome() {
    window.location.href = 'index.html';
}

function mostrarMensagem(msg, tipo) {
    const div = document.createElement('div');
    div.className = 'mensagem-flutuante';
    div.textContent = msg;
    div.style.backgroundColor = tipo === 'success' ? '#28a745' : '#dc3545';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}
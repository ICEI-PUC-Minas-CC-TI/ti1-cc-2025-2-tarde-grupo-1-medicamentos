// Configuração da API - JSON Server
const API_URL = 'http://localhost:3000';


// Estado da aplicação
let pacientes = [];
let editandoId = null;
let filtroAtual = '';
let tipoFiltro = '';
let idadeFiltro = '';
let ordenacaoAtual = 'nome';
let timerSegundos = 0;
let timerInterval;

// Controle para evitar duplicação
let processandoCadastro = false;

// Elementos do DOM
const form = document.getElementById('form-paciente');
const btnInserir = document.getElementById('btn-inserir');
const btnAtualizar = document.getElementById('btn-atualizar');
const btnCancelar = document.getElementById('btn-cancelar');
const btnVoltar = document.getElementById('btn-voltar');
const btnExportar = document.getElementById('btn-exportar');
const listaPacientes = document.getElementById('lista-pacientes');
const contadorPacientes = document.getElementById('contador-pacientes');
const inputPesquisa = document.getElementById('input-pesquisa');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroIdade = document.getElementById('filtro-idade');
const ordenacao = document.getElementById('ordenacao');
const timerElement = document.getElementById('timer');
const timerStatus = document.getElementById('timer-status');

// EVENTO 1: onload - Inicialização da página
function inicializarPagina() {
    carregarPacientes();
    configurarEventos();
    iniciarTimer();
}

// EVENTO 2: onclick - Configuração de eventos de botão
function configurarEventos() {
    // Remove event listeners antigos para evitar duplicação
    btnInserir.onclick = null;
    btnAtualizar.onclick = null;
    
    // Adiciona os event listeners
    btnInserir.addEventListener('click', inserirPaciente);
    btnAtualizar.addEventListener('click', atualizarPaciente);
    btnCancelar.addEventListener('click', cancelarEdicao);
    btnVoltar.addEventListener('click', voltarParaHome);
    btnExportar.addEventListener('click', exportarDados);
    
    // Prevenir submit duplo no formulário
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    });
    
    // Máscara para telefone
    const contatoInput = document.getElementById('contato');
    contatoInput.addEventListener('input', aplicarMascaraTelefone);
}

// EVENTO 5: Timer - Atualização automática
function iniciarTimer() {
    timerInterval = setInterval(() => {
        timerSegundos++;
        const minutos = Math.floor(timerSegundos / 60);
        const segundos = timerSegundos % 60;
        timerElement.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        
        // Atualizar dados a cada 30 segundos
        if (timerSegundos % 30 === 0) {
            carregarPacientes();
            timerStatus.textContent = '🟢 Dados Atualizados';
            setTimeout(() => {
                timerStatus.textContent = '🟢 Sistema Online';
            }, 2000);
        }
    }, 1000);
}

// ========== OPERAÇÕES CRUD COM JSON SERVER ==========

// CREATE - Inserir novo paciente
async function inserirPaciente() {
    // Prevenir duplicação
    if (processandoCadastro) {
        console.log('Cadastro já em andamento...');
        return;
    }
    
    if (!validarFormulario()) return;

    processandoCadastro = true;
    btnInserir.disabled = true;
    btnInserir.textContent = 'Cadastrando...';

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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paciente)  
        });

        if (response.ok) {
            mostrarMensagem('Paciente cadastrado com sucesso!', 'success');
            await carregarPacientes();
            limparFormulario();
            timerStatus.textContent = '🟢 Cadastro Realizado';
        } else {
            throw new Error('Erro ao cadastrar paciente');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao cadastrar paciente. Verifique se o JSON Server está rodando.', 'error');
        timerStatus.textContent = '🔴 Erro de Conexão';
    } finally {
        // Sempre reativa o botão, mesmo em caso de erro
        processandoCadastro = false;
        btnInserir.disabled = false;
        btnInserir.textContent = 'Cadastrar';
    }
}

// READ - Carregar todos os pacientes
async function carregarPacientes() {
    try {
        const response = await fetch(`${API_URL}/pacientes`);
        
        if (response.ok) {
            pacientes = await response.json();
            exibirPacientes();
        } else {
            throw new Error('Erro ao carregar pacientes');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar pacientes. Verifique se o JSON Server está rodando.', 'error');
        listaPacientes.innerHTML = `
            <div class="lista-vazia">
                ❌ Erro ao conectar com o servidor.<br>
                Certifique-se de que o JSON Server está rodando:<br>
                <code>npm run server</code>
            </div>
        `;
        timerStatus.textContent = '🔴 Servidor Offline';
    }
}

// UPDATE - Atualizar paciente
async function atualizarPaciente() {
    if (processandoCadastro) return;
    if (!validarFormulario() || !editandoId) return;

    processandoCadastro = true;
    btnAtualizar.disabled = true;
    btnAtualizar.textContent = 'Atualizando...';

    const paciente = {
        nome: document.getElementById('nome').value.trim(),
        idade: parseInt(document.getElementById('idade').value),
        contato: document.getElementById('contato').value.trim(),
        tipo: document.getElementById('tipo').value,
        dataCadastro: new Date().toISOString(),
        ativo: true
    };

    try {
        const response = await fetch(`${API_URL}/pacientes/${editandoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paciente)
        });

        if (response.ok) {
            mostrarMensagem('Paciente atualizado com sucesso!', 'success');
            await carregarPacientes();
            cancelarEdicao();
            timerStatus.textContent = '🟢 Atualização Realizada';
        } else {
            throw new Error('Erro ao atualizar paciente');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao atualizar paciente', 'error');
    } finally {
        processandoCadastro = false;
        btnAtualizar.disabled = false;
        btnAtualizar.textContent = 'Atualizar';
    }
}

// DELETE - Excluir paciente
async function excluirPaciente(id) {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return;

    try {
        const response = await fetch(`${API_URL}/pacientes/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            mostrarMensagem('Paciente excluído com sucesso!', 'success');
            await carregarPacientes();
            timerStatus.textContent = '🟢 Exclusão Realizada';
        } else {
            throw new Error('Erro ao excluir paciente');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao excluir paciente', 'error');
    }
}

// ========== FUNCIONALIDADES DE APRESENTAÇÃO ==========

// Exibir pacientes com filtros e ordenação
function exibirPacientes() {
    let pacientesFiltrados = [...pacientes];

    // Aplicar filtro de pesquisa
    if (filtroAtual) {
        pacientesFiltrados = pacientesFiltrados.filter(paciente =>
            paciente.nome.toLowerCase().includes(filtroAtual.toLowerCase())
        );
    }

    // Aplicar filtro de tipo
    if (tipoFiltro) {
        pacientesFiltrados = pacientesFiltrados.filter(paciente =>
            paciente.tipo === tipoFiltro
        );
    }

    // Aplicar filtro de idade
    if (idadeFiltro) {
        pacientesFiltrados = pacientesFiltrados.filter(paciente => {
            switch(idadeFiltro) {
                case 'crianca': return paciente.idade <= 12;
                case 'adolescente': return paciente.idade >= 13 && paciente.idade <= 17;
                case 'adulto': return paciente.idade >= 18 && paciente.idade <= 59;
                case 'idoso': return paciente.idade >= 60;
                default: return true;
            }
        });
    }

    // Aplicar ordenação
    pacientesFiltrados.sort((a, b) => {
        switch (ordenacaoAtual) {
            case 'idade':
                return a.idade - b.idade;
            case 'tipo':
                return a.tipo.localeCompare(b.tipo);
            case 'id':
                return new Date(b.dataCadastro) - new Date(a.dataCadastro);
            default:
                return a.nome.localeCompare(b.nome);
        }
    });

    // Atualizar contador
    contadorPacientes.textContent = `(${pacientesFiltrados.length})`;

    if (pacientesFiltrados.length === 0) {
        listaPacientes.innerHTML = `
            <div class="lista-vazia">
                ${pacientes.length === 0 ? 'Nenhum paciente cadastrado ainda.' : 'Nenhum paciente encontrado com os filtros aplicados.'}
            </div>
        `;
        return;
    }

    listaPacientes.innerHTML = pacientesFiltrados.map(paciente => `
        <div class="paciente-item" data-id="${paciente.id}">
            <div class="paciente-header">
                <div class="paciente-nome">${paciente.nome}</div>
                <div class="paciente-actions">
                    <span class="paciente-tipo">${formatarTipo(paciente.tipo)}</span>
                    <button type="button" class="btn btn-warning btn-sm" onclick="editarPaciente(${paciente.id})">
                        ✏️ Editar
                    </button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="excluirPaciente(${paciente.id})">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
            <div class="paciente-details">
                <div class="paciente-detail">
                    <strong>Idade:</strong> ${paciente.idade} anos
                </div>
                <div class="paciente-detail">
                    <strong>Contato:</strong> ${paciente.contato}
                </div>
                <div class="paciente-detail">
                    <strong>Tipo:</strong> ${formatarTipo(paciente.tipo)}
                </div>
                <div class="paciente-detail">
                    <strong>Cadastro:</strong> ${formatarData(paciente.dataCadastro)}
                </div>
            </div>
        </div>
    `).join('');
}

// Editar paciente
function editarPaciente(id) {
    const paciente = pacientes.find(p => p.id === id);
    if (!paciente) return;

    editandoId = id;
    
    // Preencher formulário
    document.getElementById('nome').value = paciente.nome;
    document.getElementById('idade').value = paciente.idade;
    document.getElementById('contato').value = paciente.contato;
    document.getElementById('tipo').value = paciente.tipo;

    // Mostrar botões de edição
    btnInserir.style.display = 'none';
    btnAtualizar.style.display = 'block';
    btnCancelar.style.display = 'block';

    // Scroll para o formulário
    form.scrollIntoView({ behavior: 'smooth' });
    
    mostrarMensagem(`Editando paciente: ${paciente.nome}`, 'info');
}

// Cancelar edição
function cancelarEdicao() {
    editandoId = null;
    limparFormulario();
    btnInserir.style.display = 'block';
    btnAtualizar.style.display = 'none';
    btnCancelar.style.display = 'none';
    mostrarMensagem('Edição cancelada', 'info');
}

// Aplicar filtros
function aplicarFiltros() {
    filtroAtual = inputPesquisa.value;
    tipoFiltro = filtroTipo.value;
    idadeFiltro = filtroIdade.value;
    exibirPacientes();
}

// Aplicar ordenação
function aplicarOrdenacao() {
    ordenacaoAtual = ordenacao.value;
    exibirPacientes();
}

// ========== FUNÇÕES AUXILIARES ==========

// Validar formulário
function validarFormulario() {
    const campos = ['nome', 'idade', 'contato', 'tipo'];
    let valido = true;
    
    campos.forEach(campo => {
        const input = document.getElementById(campo);
        if (!input.value.trim()) {
            input.style.borderColor = '#dc3545';
            valido = false;
        } else {
            input.style.borderColor = '#ddd';
        }
    });

    // Validação específica da idade
    const idadeInput = document.getElementById('idade');
    const idade = parseInt(idadeInput.value);
    if (idade < 0 || idade > 150) {
        idadeInput.style.borderColor = '#dc3545';
        valido = false;
        mostrarMensagem('Idade deve estar entre 0 e 150 anos', 'error');
    }
    
    if (!valido) {
        mostrarMensagem('Preencha todos os campos obrigatórios corretamente!', 'error');
    }
    
    return valido;
}

// Limpar formulário
function limparFormulario() {
    form.reset();
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.style.borderColor = '#ddd';
    });
}

// Aplicar máscara de telefone
function aplicarMascaraTelefone(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        e.target.value = value;
    }
}

// Exportar dados
function exportarDados() {
    const dataStr = JSON.stringify(pacientes, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pacientes_cuidamed.json';
    link.click();
    URL.revokeObjectURL(url);
    mostrarMensagem('Dados exportados com sucesso!', 'success');
}

// Formatadores
function formatarData(data) {
    if (!data) return '-';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
}

function formatarTipo(tipo) {
    const tipos = {
        'pessoa': 'Pessoa',
        'dependente': 'Dependente', 
        'idoso': 'Idoso'
    };
    return tipos[tipo] || tipo;
}

// Voltar para home
function voltarParaHome() {
    window.location.href = 'index.html';
}

// Mostrar mensagem
function mostrarMensagem(mensagem, tipo) {
    const mensagemAnterior = document.querySelector('.mensagem-flutuante');
    if (mensagemAnterior) {
        mensagemAnterior.remove();
    }
    
    const div = document.createElement('div');
    div.className = `mensagem-flutuante mensagem-${tipo}`;
    div.textContent = mensagem;
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        ${tipo === 'success' ? 'background-color: #28a745;' : 
          tipo === 'error' ? 'background-color: #dc3545;' :
          tipo === 'info' ? 'background-color: #17a2b8;' :
          'background-color: #6c757d;'}
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(div);
    
    setTimeout(() => {
        if (div.parentElement) {
            div.remove();
        }
    }, 4000);
}

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .mensagem-flutuante {
        display: flex;
        align-items: center;
        gap: 10px;
    }
`;
document.head.appendChild(style);
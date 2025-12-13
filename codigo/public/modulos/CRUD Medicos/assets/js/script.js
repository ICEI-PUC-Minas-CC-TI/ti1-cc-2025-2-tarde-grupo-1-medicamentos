const doctorsListContainer = document.getElementById("doctors-list");
const formCadastroMedico = document.getElementById("form-cadastro-medico");
const nomeInput = document.getElementById("nome-medico");
const idadeInput = document.getElementById("idade-medico");
const contatoInput = document.getElementById("contato-medico");
const especialidadeInput = document.getElementById("especialidade-medico");
const editIdInput = document.getElementById("edit-id");
const formButton = document.getElementById("btn-submit");
const btnVoltar = document.getElementById("btn-voltar");
const countMedicosSpan = document.getElementById("count-medicos");
const pesquisarNomeInput = document.getElementById("pesquisar-nome");
const btnPesquisar = document.querySelector(".btn-pesquisar");
const filtroEspecialidadeSelect = document.getElementById("filtro-especialidade");
const ordenarNomeSelect = document.getElementById("ordenar-nome");
const filtroIdadeSelect = document.getElementById("filtro-idade");

let API_URL = "/medicos";
let todosMedicos = []; 

function iniciarMenuMobile() {
    const btnHamburger = document.getElementById('btn-hamburger');
    const btnFechar = document.getElementById('btn-fechar-menu');
    const navMenu = document.getElementById('nav-menu');

    if (btnHamburger && navMenu) {
        btnHamburger.addEventListener('click', () => {
            navMenu.classList.add('menu-aberto');
        });
    }

    if (btnFechar && navMenu) {
        btnFechar.addEventListener('click', () => {
            navMenu.classList.remove('menu-aberto');
        });
    }

    if (navMenu) {
        const linksMenu = navMenu.querySelectorAll('a');
        linksMenu.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => {
                    navMenu.classList.remove('menu-aberto');
                }, 100); 
            });
        });
        
        const menuItemsWithSub = navMenu.querySelectorAll('.menu-item > a[href="#"]');
        menuItemsWithSub.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault(); 
                const subMenu = item.nextElementSibling;
                if (subMenu && subMenu.tagName === 'UL') {
                    if (subMenu.style.display === 'block') {
                        subMenu.style.display = 'none';
                    } else {
                        navMenu.querySelectorAll('.menu-item > ul').forEach(ul => {
                            if (ul !== subMenu) ul.style.display = 'none';
                        });
                        subMenu.style.display = 'block';
                    }
                }
            });
        });
    }
}

// --- READ (Carrega e Filtra os dados) ---
async function pegarMedicos() {
    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) {
            throw new Error(`Erro HTTP! Status: ${resposta.status}`);
        }
        todosMedicos = await resposta.json();
        
        renderizarListaMedicos(todosMedicos);
        configurarFiltrosListeners(); 

    } catch (erro) {
        console.error("Erro ao carregar médicos:", erro);
        doctorsListContainer.innerHTML = `<p style="color: red; padding: 10px;">Não foi possível carregar os dados. Verifique o servidor (${API_URL}).</p>`;
        if (countMedicosSpan) {
            countMedicosSpan.textContent = 0;
        }
    }
}

function aplicarFiltros() {
    let medicosFiltrados = [...todosMedicos];
    
    const termoBusca = pesquisarNomeInput.value.toLowerCase().trim();
    const filtroEspecialidade = filtroEspecialidadeSelect.value;
    const ordenacao = ordenarNomeSelect.value;
    const filtroIdade = filtroIdadeSelect.value;

    if (termoBusca) {
        medicosFiltrados = medicosFiltrados.filter(med => 
            med.nome.toLowerCase().includes(termoBusca)
        );
    }
    if (filtroEspecialidade !== 'Todos') {
        medicosFiltrados = medicosFiltrados.filter(med => 
            med.especialidade === filtroEspecialidade
        );
    }

    if (filtroIdade !== 'Todas') {
        medicosFiltrados = medicosFiltrados.filter(med => {
            const idade = parseInt(med.idade, 10);
            
            if (filtroIdade === 'Ate_30') return idade <= 30;
            if (filtroIdade === 'De_31_a_50') return idade >= 31 && idade <= 50;
            if (filtroIdade === 'Mais_50') return idade > 50;
            
            return true; 
        });
    }

    if (ordenacao === 'Nome_ASC') {
        medicosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (ordenacao === 'Nome_DESC') {
        medicosFiltrados.sort((a, b) => b.nome.localeCompare(a.nome));
    } else if (ordenacao === 'Idade_ASC') {
        medicosFiltrados.sort((a, b) => a.idade - b.idade);
    } else if (ordenacao === 'Idade_DESC') {
        medicosFiltrados.sort((a, b) => b.idade - a.idade);
    }

    renderizarListaMedicos(medicosFiltrados);
}

function renderizarListaMedicos(dados) {
    doctorsListContainer.innerHTML = '';

    if (dados.length === 0) {
        doctorsListContainer.innerHTML = `<p>Nenhum médico encontrado com os filtros aplicados.</p>`;
    }

    dados.forEach((med) => {
        const specialtyClass = `specialty-${med.especialidade.toLowerCase().replace(/ /g, '-')}`;

        
        let nomeFormatado = med.nome;
        if (nomeFormatado.toLowerCase().startsWith('dr.') || nomeFormatado.toLowerCase().startsWith('dra.')) {
            
            nomeFormatado = nomeFormatado.replace(/dr\.\s?|dra\.\s?/i, '').trim(); 
        }
 
        const prefixo = (med.nome.toLowerCase().startsWith('dr.') || med.nome.toLowerCase().startsWith('dra.')) ? '' : 'Dr. ';
        
        const cardHtml = `
        <div class="doctor-card">
            <div class="doctor-info">
                <p class="doctor-name">${prefixo}${nomeFormatado}</p>
                <div class="details-row">
                    <span class="detail-icon">👤</span>
                    <span class="detail-age">${med.idade} anos</span>
                    <span class="detail-contact">${med.contato}</span>
                    <span class="detail-specialty ${specialtyClass}">${med.especialidade}</span>
                </div>
            </div>
            <div class="card-actions">
                <button type="button" class="action-edit" data-id="${med.id}">✏️</button>
                <button type="button" class="action-delete" data-id="${med.id}">❌</button>
            </div>
        </div>
        `;
        doctorsListContainer.innerHTML += cardHtml;
    });

    if (countMedicosSpan) {
        countMedicosSpan.textContent = dados.length;
    }

    adicionarDelete();
    adicionarEditar();
}

function configurarFiltrosListeners() {
    pesquisarNomeInput.addEventListener('input', aplicarFiltros);
    btnPesquisar.addEventListener('click', aplicarFiltros);
    filtroEspecialidadeSelect.addEventListener('change', aplicarFiltros);
    ordenarNomeSelect.addEventListener('change', aplicarFiltros);
    filtroIdadeSelect.addEventListener('change', aplicarFiltros);
}


// CREATE / UPDATE
formCadastroMedico.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
    event.preventDefault();

    const id = editIdInput.value;

    const dadosMedico = {
        nome: nomeInput.value.replace(/dr\.\s?|dra\.\s?/i, '').trim(),
        idade: parseInt(idadeInput.value, 10),
        contato: contatoInput.value,
        especialidade: especialidadeInput.value,
        status: "ativo"
    };

    if (id) {
        await atualizarMedico(id, dadosMedico);
    } else {
        await criarNovoMedico(dadosMedico);
    }
}

// CREATE
async function criarNovoMedico(dados) {
    try {
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) throw new Error("Falha ao cadastrar médico.");

        resetarFormulario();
        await pegarMedicos();
        alert("Médico cadastrado com sucesso!");

    } catch (erro) {
        console.error("Erro ao cadastrar médico:", erro);
        alert("Erro ao cadastrar médico. Detalhes: " + erro.message);
    }
}

// UPDATE - Carregar dados para edição
function adicionarEditar() {
    document.querySelectorAll('.action-edit').forEach(btn => {
        btn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            const id = this.getAttribute('data-id');
            carregarDadosParaEdicao(id);
        });
    });
}

async function carregarDadosParaEdicao(id) {
    try {
        const resposta = await fetch(`${API_URL}/${id}`);
        if (!resposta.ok) throw new Error("Erro ao buscar dados do médico.");

        const med = await resposta.json();
        nomeInput.value = med.nome; 
        idadeInput.value = med.idade;
        contatoInput.value = med.contato;
        especialidadeInput.value = med.especialidade;
        editIdInput.value = id;

        formButton.textContent = "Salvar Alterações";
        formButton.style.backgroundColor = '#4f9ba3';
        formCadastroMedico.scrollIntoView({ behavior: 'smooth' });
    } catch (erro) {
        console.error("Erro ao carregar dados para edição:", erro);
        alert("Não foi possível carregar os dados para edição.");
    }
}

// PUT (Atualizar)
async function atualizarMedico(id, dados) {
    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) throw new Error("Falha ao atualizar médico.");

        resetarFormulario();
        await pegarMedicos();
        alert("Médico atualizado com sucesso!");

    } catch (erro) {
        console.error("Erro ao atualizar médico:", erro);
        alert("Erro ao atualizar médico. Detalhes: " + erro.message);
    }
}

function resetarFormulario() {
    formCadastroMedico.reset();
    editIdInput.value = "";
    formButton.textContent = "Cadastrar";
    formButton.style.backgroundColor = '#69B7BF';
}

btnVoltar.addEventListener('click', resetarFormulario);


// DELETE
async function excluirMedico(id) {
    if (!confirm("Tem certeza que deseja excluir este médico?")) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

        if (resposta.ok) {
            await pegarMedicos();
            alert("Médico excluído com sucesso!");
        } else {
            throw new Error("Erro ao excluir médico na API.");
        }
    } catch (error) {
        console.error("Erro ao excluir médico: ", error); 
        alert("Erro ao excluir médico! Detalhes: " + error.message);
    }
}

function adicionarDelete() {
    document.querySelectorAll('.action-delete').forEach(btn => {
        btn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            const id = this.getAttribute('data-id');
            excluirMedico(id);
        });
    });
}
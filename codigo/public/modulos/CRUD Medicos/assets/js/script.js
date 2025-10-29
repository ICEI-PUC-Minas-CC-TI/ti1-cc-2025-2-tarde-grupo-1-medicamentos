const cardContainer = document.querySelector(".card-container");
const formCadastro = document.getElementById("form-cadastro");
const nomeInput = document.getElementById("nome");
const idadeInput = document.getElementById("idade");
const contatoInput = document.getElementById("contato");
const especialidadeInput = document.getElementById("especialidade");
const editIdInput = document.getElementById("edit-id"); 
const formButton = document.getElementById("btn-submit");

let API_URL = "http://localhost:3000/medicos";

// READ 
async function pegarMedicos() {
    try {
        console.log("Iniciando fetch...");
        const resposta = await fetch(API_URL);
        console.log("Resposta: ", resposta.status);
        const dados = await resposta.json();
        console.log("Dados recebidos: ", dados);

        let lista = '';

        dados.forEach((med, index) => {
            console.log(`Processando Médico ${index}: `, med);

            lista += `
            <section class="card">
                <div class="content">
                    <p class="nome">${med.nome}</p>
                    <p class="idade">${med.idade} anos</p>
                    <p class="contato">${med.contato}</p>
                    <p class="especialidade">${med.especialidade}</p>
                </div>
                <div class="buttons-card">
                    <button type="button" class="btn-excluir-card" data-id="${med.id}">Excluir</button>
                    <button type="button" class="btn-editar-card" data-id="${med.id}">Editar</button>
                </div>
            </section>
            `;
        });

        const h1 = cardContainer.querySelector('h1').outerHTML;
        const titles = cardContainer.querySelector('.card-item').outerHTML;
        cardContainer.innerHTML = h1 + titles; 
        cardContainer.innerHTML += lista; 

        adicionarDelete();
        adicionarEditar();

    } catch (erro) {
        console.error("Erro ao carregar médicos:", erro);
    }
}

// CREATE / UPDATE
formCadastro.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
    event.preventDefault();

    const id = editIdInput.value;

    const dadosMedico = {
        nome: nomeInput.value,
        idade: idadeInput.value,
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
        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        resetarFormulario();
        await pegarMedicos();

    } catch (erro) {
        console.error("Erro ao cadastrar médico:", erro);
    }
}

// UPDATE 
function adicionarEditar() {
    document.querySelectorAll('.btn-editar-card').forEach(btn => {
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

        formCadastro.scrollIntoView({ behavior: 'smooth' });
    } catch (erro) {
        console.error("Erro ao carregar dados para edição:", erro);
        alert("Não foi possível carregar os dados para edição.");
    }
}

// PUT
async function atualizarMedico(id, dados) {
    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            throw new Error("Erro ao atualizar médico.");
        }

        resetarFormulario();
        await pegarMedicos(); 
        alert("Médico atualizado com sucesso!");

    } catch (erro) {
        console.error("Erro ao atualizar médico:", erro);
        alert("Erro ao atualizar médico.");
    }
}

function resetarFormulario() {
    formCadastro.reset();
    editIdInput.value = ""; 
    formButton.textContent = "Cadastrar"; 
}

// DELETE 
async function excluirMedico(id) {
    if (!confirm("Tem certeza que deseja excluir este médico?")) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            await pegarMedicos(); 
            alert("Médico excluído com sucesso!");
        } else {
            alert("Erro ao excluir médico!");
        }
    } catch (error) {
        console.error("Erro ao excluir médico: ", error); 
        alert("Erro ao excluir médico!");
    }
}

function adicionarDelete() {
    document.querySelectorAll('.btn-excluir-card').forEach(btn => {
        btn.addEventListener('click', function (event) { 
            event.preventDefault(); 
            event.stopPropagation(); 
            const id = this.getAttribute('data-id');
            excluirMedico(id);
        });
    });
}

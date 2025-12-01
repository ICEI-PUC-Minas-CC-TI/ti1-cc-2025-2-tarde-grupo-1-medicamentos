const cardContainer = document.querySelector(".card-container");
const formCadastro = document.getElementById("form-cadastro");
const nomeInput = document.getElementById("nome");
const doseInput = document.getElementById("dose");
const intervaloInput = document.getElementById("intervalo");
const doseEmbalagemInput = document.getElementById("doseEmbalagem");
const editIdInput = document.getElementById("edit-id");
const formButton = document.getElementById("btn-submit");

let API_URL = "http://localhost:3000/medicamentos";

// READ 
async function pegarmedicamentos() {
    try {
        console.log("iniciando fetch...");
        const resposta = await fetch(API_URL);
        console.log("resposta: ", resposta.status);
        const dados = await resposta.json();
        console.log("Dados recebidos: ", dados);

        let lista = '';

        dados.forEach((med, index) => {
            console.log(`processando medicamentos ${index}: `, med);


            lista += `
            <a href="detalhes.html?id=${med.id}">
                <section class="card">
                    <div class="content">
                        <p class="check-area"> . </p>
                        <img src="${med.imagem || './assets/images/medicamentos/padrao.jpg'}" 
                            alt="${med.nome}" 
                            class="medicamento-imagem"
                            onerror="this.src='./assets/images/medicamentos/padrao.jpg'">
                        <p class="horario">${med.intervalo}</p>
                        <p class="nome">${med.nome}</p>
                        <p class="dose">${med.dose}</p>
                    </div>
                    <div class="buttons-card">
                        <button type="button" class="btn-excluir-card" data-id="${med.id}">Excluir</button>
                        <button type="button" class="btn-editar-card" data-id="${med.id}">Editar</button>
                        <button type="button">Ver mais</button>
                    </div>
                </section>
            </a>
            `;
        });

        const h1 = cardContainer.querySelector('h1').outerHTML;
        const titles = cardContainer.querySelector('.card-item').outerHTML;
        cardContainer.innerHTML = h1 + titles;
        cardContainer.innerHTML += lista;

        adicionarDelete();
        adicionarEditar();

    } catch (erro) {
        console.error("Erro ao carregar medicamentos:", erro);
    }
}

// CREATE / UPDATE
formCadastro.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
    event.preventDefault();

    const id = editIdInput.value;

    const dadosMedicamento = {
        nome: nomeInput.value,
        dose: doseInput.value,
        intervalo: intervaloInput.value,
        dosePorEmbalagem: doseEmbalagemInput.value,
        tipo: tipoInput.value,
        status: "ativo"
    };

    if (id) {
        await atualizarMedicamento(id, dadosMedicamento);
    } else {
        await criarNovoMedicamento(dadosMedicamento);
    }
}

// CREATE 
async function criarNovoMedicamento(dados) {
    try {
        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        resetarFormulario();
        await pegarmedicamentos();

    } catch (erro) {
        console.error("Erro ao cadastrar medicamento:", erro);
    }
}

//UPDATE 
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
        if (!resposta.ok) throw new Error("Erro ao buscar dados do medicamento.");

        const med = await resposta.json();

        nomeInput.value = med.nome;
        doseInput.value = med.dose;
        intervaloInput.value = med.intervalo;
        doseEmbalagemInput.value = med.dosePorEmbalagem;
        tipoInput.value = med.tipo || '';
        editIdInput.value = id;

        formButton.textContent = "Salvar Alterações";

        formCadastro.scrollIntoView({ behavior: 'smooth' });
    } catch (erro) {
        console.error("Erro ao carregar dados para edição:", erro);
        alert("Não foi possível carregar os dados para edição.");
    }
}

//PUT
async function atualizarMedicamento(id, dados) {
    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            throw new Error("Erro ao atualizar medicamento.");
        }

        resetarFormulario();
        await pegarmedicamentos();
        alert("Medicamento atualizado com sucesso!");

    } catch (erro) {
        console.error("Erro ao atualizar medicamento:", erro);
        alert("Erro ao atualizar medicamento.");
    }
}

function resetarFormulario() {
    formCadastro.reset();
    editIdInput.value = "";
    formButton.textContent = "Cadastrar";
}

// DELETE 
async function excluirmedicamento(id) {
    if (!confirm("Tem certeza que deja exclui este medicamento?")) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            await pegarmedicamentos();
            alert("Medicamentos excluidos com sucesso!");
        } else {
            alert("Erro ao excluir medicamento!");
        }
    } catch (error) {
        console.error("Erro ao excluir medicamento: ", error);
        alert("Erro ao excluir medicamento!");
    }
}

function adicionarDelete() {
    document.querySelectorAll('.btn-excluir-card').forEach(btn => {
        btn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            const id = this.getAttribute('data-id');
            excluirmedicamento(id);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    pegarmedicamentos();
});
const cardContainer = document.querySelector(".card-container");
const formCadastro = document.getElementById("form-cadastro");
const nomeInput = document.getElementById("nome");
const doseInput = document.getElementById("dose");
const intervaloInput = document.getElementById("intervalo");
const doseEmbalagemInput = document.getElementById("doseEmbalagem");
const editIdInput = document.getElementById("edit-id"); 
const formButton = document.getElementById("btn-submit");

let API_URL = "http://localhost:3000/medicamentos";

async function buscarMedicamentoPorId(id) {
    const resposta = await fetch(`${API_URL}/${id}`);
    if (!resposta.ok) throw new Error("Erro ao buscar dados do medicamento.");
    return await resposta.json();
}

// READ 
async function pegarmedicamentos() {
    try {
        console.log("iniciando fetch...");
        const resposta = await fetch(API_URL);
        const dados = await resposta.json();

        dados.sort((a, b) => {
            if (a.check && !b.check) return 1;
            if (!a.check && b.check) return -1;
            return 0;
        });

        let lista = '';

        dados.forEach((med) => {
            const checkIcon = med.check ? '<img src="./assets/images/check.png" alt="Concluído" style="width: 15px; height: 15px;">' : ''; 
            
            const concluidoClass = med.check ? 'concluido' : '';

            lista += `
            <a href="index.html?id=${med.id}" class="card-link">
                <section class="card ${concluidoClass}">
                
                    <div class="content">
                        <p class="check-area" data-id="${med.id}" data-check="${med.check}">${checkIcon}</p>
                        
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

        const h1 = cardContainer.querySelector('h1') ? cardContainer.querySelector('h1').outerHTML : '';
        const titles = cardContainer.querySelector('.card-item') ? cardContainer.querySelector('.card-item').outerHTML : '';

        if(h1 && titles) {
             cardContainer.innerHTML = h1 + titles + lista;
        } else {
            const linksAntigos = cardContainer.querySelectorAll('a');
            linksAntigos.forEach(link => link.remove());
            cardContainer.innerHTML += lista;
        }

        adicionarDelete();
        adicionarEditar();
        adicionarToggleCheck(); 

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
        status: "ativo",
        check: false 
    };

    if (id) {
        try {
            const medExistente = await buscarMedicamentoPorId(id);
            dadosMedicamento.check = medExistente.check; 
            await atualizarMedicamento(id, dadosMedicamento);
        } catch (e) {
            console.error("Erro ao buscar dados pré-edição", e);
        }
    } else {
        await criarNovoMedicamento(dadosMedicamento);
    }
}

// CREATE 
async function criarNovoMedicamento(dados) {
    try {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        resetarFormulario();
        await pegarmedicamentos();
    } catch (erro) {
        console.error("Erro ao cadastrar medicamento:", erro);
    }
}

// EDITAR 
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
        const med = await buscarMedicamentoPorId(id);
        nomeInput.value = med.nome;
        doseInput.value = med.dose;
        intervaloInput.value = med.intervalo;
        doseEmbalagemInput.value = med.dosePorEmbalagem; 
        editIdInput.value = id; 
        formButton.textContent = "Salvar Alterações";
        formCadastro.scrollIntoView({ behavior: 'smooth' });
    } catch (erro) {
        console.error("Erro ao carregar dados para edição:", erro);
        alert("Não foi possível carregar os dados para edição.");
    }
}

// PUT 
async function atualizarMedicamento(id, dados) {
    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        if (!resposta.ok) throw new Error("Erro ao atualizar medicamento.");
        resetarFormulario();
        await pegarmedicamentos(); 
        alert("Medicamento atualizado com sucesso!");
    } catch (erro) {
        console.error("Erro ao atualizar medicamento:", erro);
        alert("Erro ao atualizar medicamento.");
    }
}

async function toggleCheckMedicamento(id, isChecked) {
    try {
        const med = await buscarMedicamentoPorId(id);
        const dadosAtualizados = { ...med, check: isChecked };

        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosAtualizados)
        });

        if (!resposta.ok) throw new Error("Erro ao atualizar status.");
        await pegarmedicamentos(); 
    } catch (erro) {
        console.error("Erro ao dar check:", erro);
    }
}

function adicionarToggleCheck() {
    document.querySelectorAll('.check-area').forEach(checkArea => {
        checkArea.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation(); 
            const id = this.getAttribute('data-id');
            const currentCheck = this.getAttribute('data-check') === 'true'; 
            toggleCheckMedicamento(id, !currentCheck);
        });
    });
}

function resetarFormulario() {
    formCadastro.reset();
    editIdInput.value = ""; 
    formButton.textContent = "Cadastrar"; 
}

// DELETE 
async function excluirmedicamento(id) {
    if (!confirm("Tem certeza que deseja excluir este medicamento?")) return;
    try {
        const resposta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (resposta.ok) {
            await pegarmedicamentos(); 
            alert("Medicamento excluído com sucesso!");
        } else {
            alert("Erro ao excluir medicamento!");
        }
    } catch (error) {
        console.error("Erro ao excluir medicamento: ", error); 
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

document.addEventListener('DOMContentLoaded', pegarmedicamentos);
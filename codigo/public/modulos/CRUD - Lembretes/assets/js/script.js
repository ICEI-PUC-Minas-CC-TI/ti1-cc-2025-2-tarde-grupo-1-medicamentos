const cardContainerWrapper = document.querySelector(".card-container-wrapper");
const cardContainer = document.querySelector(".card-container"); 
const formCadastro = document.getElementById("form-cadastro");
const dataHoraInput = document.getElementById("data-hora");
const todoDiaInput = document.getElementById("todoDia");
const textAreaInput = document.getElementById("textArea");

const editIdInput = document.getElementById("edit-id"); 
const formButton = document.getElementById("btnSalvar"); 

let API_URL = "http://localhost:3000/lembretes";

function formatarDataHora(isoString) {
    if (!isoString) return '';
    const data = new Date(isoString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} - ${hora}:${minuto}`;
}

// READ
async function pegarLembretes() {
    try {
        console.log("Iniciando fetch de lembretes...");
        const resposta = await fetch(API_URL);
        const dados = await resposta.json();

        dados.sort((a, b) => {
            if (a.check && !b.check) return 1;
            if (!a.check && b.check) return -1;
            return 0;
        });

        let lista = '';

        dados.forEach((lembrete) => {
            const dataFormatada = formatarDataHora(lembrete.dataHora);
            
            const concluidoClass = lembrete.check ? 'concluido' : '';
            const checkIcon = lembrete.check ? '<img src="./assets/images/check.png" alt="Tarefa concluída" style="width: 15px; height: 15px;">' : ''; 

            lista += `
            <div class="card ${concluidoClass}">
                <div class="content">
                    <p class="check-area" data-id="${lembrete.id}" data-check="${lembrete.check}">${checkIcon}</p>
                    <p class="horario">${dataFormatada}</p>
                    <p class="lembrete">${lembrete.titulo || lembrete.conteudo}</p>
                </div>
                <div class="buttons-card">
                    <img src="./assets/images/lapis.png" alt="Editar" class="btn-editar-card" data-id="${lembrete.id}">
                    <img src="./assets/images/lixeira.png" alt="Excluir" class="btn-excluir-card" data-id="${lembrete.id}">
                </div>
            </div>
            `;
        });
        
        const listaAntiga = cardContainerWrapper.querySelectorAll('.card');
        listaAntiga.forEach(card => card.remove());
        
        cardContainerWrapper.innerHTML += lista;

        adicionarToggleCheck();
        adicionarDelete();
        adicionarEditar();

    } catch (erro) {
        console.error("Erro ao carregar lembretes:", erro);
    }
}

async function buscarLembretePorId(id) {
    const resposta = await fetch(`${API_URL}/${id}`);
    if (!resposta.ok) throw new Error("Erro ao buscar dados do lembrete.");
    return await resposta.json();
}

// CREATE / UPDATE
formCadastro.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
    event.preventDefault();

    const id = editIdInput.value;
    const isTodoDia = todoDiaInput.checked;
    let dataHoraValue = dataHoraInput.value;

    if (!textAreaInput.value || !dataHoraValue) {
        alert("Por favor, preencha o conteúdo, a data e a hora do lembrete.");
        return;
    }
    

    if(isTodoDia) {
        
    }
    
    const dadosLembrete = {
        titulo: textAreaInput.value.substring(0, 50), 
        conteudo: textAreaInput.value,
        dataHora: dataHoraValue,
        todoDia: isTodoDia,
        check: false, 
        status: "pendente",
        idPessoa: 1 
    };
    
    if (id) {
        const lembreteExistente = await buscarLembretePorId(id);
        dadosLembrete.check = lembreteExistente.check;
        dadosLembrete.status = lembreteExistente.status;
        await atualizarLembrete(id, dadosLembrete);
    } else {
        await criarNovoLembrete(dadosLembrete);
    }
}

// CREATE 
async function criarNovoLembrete(dados) {
    try {
        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        resetarFormulario();
        await pegarLembretes();
        alert("Lembrete cadastrado com sucesso!");

    } catch (erro) {
        console.error("Erro ao cadastrar lembrete:", erro);
        alert("Erro ao cadastrar lembrete.");
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
        const lembrete = await buscarLembretePorId(id);

        dataHoraInput.value = lembrete.dataHora.substring(0, 16); 
        todoDiaInput.checked = lembrete.todoDia;
        textAreaInput.value = lembrete.titulo;
        editIdInput.value = id; 

        formButton.textContent = "Salvar Alterações";

        formCadastro.scrollIntoView({ behavior: 'smooth' });
    } catch (erro) {
        console.error("Erro ao carregar dados para edição:", erro);
        alert("Não foi possível carregar os dados para edição.");
    }
}

//PUT
async function atualizarLembrete(id, dados) {
    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            throw new Error("Erro ao atualizar lembrete.");
        }

        resetarFormulario();
        await pegarLembretes(); 
        alert("Lembrete atualizado com sucesso!");

    } catch (erro) {
        console.error("Erro ao atualizar lembrete:", erro);
        alert("Erro ao atualizar lembrete.");
    }
}

async function toggleCheckLembrete(id, isChecked) {
    try {
        const lembrete = await buscarLembretePorId(id);
        
        const dadosAtualizados = {
            ...lembrete,
            check: isChecked,
            status: isChecked ? "concluido" : "pendente"
        };

        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosAtualizados)
        });

        if (!resposta.ok) throw new Error("Erro ao atualizar status do lembrete.");

        await pegarLembretes();
    } catch (erro) {
        console.error("Erro ao dar check/uncheck no lembrete:", erro);
        alert("Erro ao atualizar o status do lembrete.");
    }
}

function adicionarToggleCheck() {
    document.querySelectorAll('.check-area').forEach(checkArea => {
        checkArea.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            const id = this.getAttribute('data-id');
            const currentCheck = this.getAttribute('data-check') === 'true'; 
            toggleCheckLembrete(id, !currentCheck);
        });
    });
}

function resetarFormulario() {
    formCadastro.reset();
    editIdInput.value = ""; 
    formButton.textContent = "Salvar"; 
}


// DELETE 
async function excluirLembrete(id) {
    if (!confirm("Tem certeza que deseja excluir este lembrete?")) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            await pegarLembretes(); 
            alert("Lembrete excluído com sucesso!");
        } else {
            alert("Erro ao excluir lembrete!");
        }
    } catch (error) {
        console.error("Erro ao excluir lembrete: ", error); 
        alert("Erro ao excluir lembrete!");

    }
}

function adicionarDelete() {
    document.querySelectorAll('.btn-excluir-card').forEach(btn => {
        btn.addEventListener('click', function (event) { 
            event.preventDefault(); 
            event.stopPropagation(); 
            const id = this.getAttribute('data-id');
            excluirLembrete(id);
        });
    });
}
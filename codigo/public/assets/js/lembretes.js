// Espera o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {

    // Fitro por dia
    const filtroData = document.getElementById('filtro-data');

    // --- LÓGICA DO MENU HAMBURGER (DA SUA BASE) ---
    const menuHamburger = document.querySelector('.menu-hamburger');
    const menuContainer = document.querySelector('.menu-container');

    if (menuHamburger && menuContainer) {
        menuHamburger.addEventListener('click', function() {
            this.classList.toggle('aberto');
            menuContainer.classList.toggle('menu-aberto');
        });
    }

    // --- LÓGICA DA PÁGINA DE LEMBRETES ---
    const API_URL = 'http://localhost:3000/lembretes';
    let filterState = 'all'; // all | pending | completed

    // Elementos do DOM
    const listContainer = document.getElementById('reminder-list-container');
    const filterButton = document.getElementById('btn-filter');
    const newReminderForm = document.getElementById('new-reminder-form');

    // Inputs do formulário
    const formDataHora = document.getElementById('form-data-hora');
    const formTitulo = document.getElementById('form-descricao');
    const formToggleEday = document.getElementById('form-toggle-eday');

    // Formatar data
    function formatarDataHora(isoString) {
        if (!isoString) return "Data inválida";
        try {
            const dataObj = new Date(isoString);
            const dia = String(dataObj.getDate()).padStart(2, '0');
            const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
            const hora = String(dataObj.getHours()).padStart(2, '0');
            const minuto = String(dataObj.getMinutes()).padStart(2, '0');
            return `${dia}/${mes} - ${hora}:${minuto}`;
        } catch (e) {
            console.error("Erro ao formatar data:", e);
            return "Data inválida";
        }
    }

    // -------------------------------
    //        CARREGAR LEMBRETES
    // -------------------------------
    async function carregarLembretes() {
        if (!listContainer) return;

        let url = `${API_URL}?_sort=dataHora&_order=asc`;

        // FILTRO POR STATUS
        if (filterState === 'pending') {
            url += '&check=false';

        } else if (filterState === 'completed') {
            url += '&check=true';
        }

        // FILTRO POR DATA
        if (filtroData && filtroData.value) {
            const dataEscolhida = filtroData.value; // yyyy-mm-dd
            url += `&dataHora_like=${dataEscolhida}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Falha ao carregar lembretes');
            
            const lembretes = await response.json();
            renderLembretes(lembretes);

        } catch (error) {
            console.error(error);
            listContainer.innerHTML = '<p class="empty-list-msg">Erro ao carregar lembretes.</p>';
        }
    }

    // Renderizar lista
    function renderLembretes(lembretesParaMostrar) {
        listContainer.innerHTML = '';

        if (lembretesParaMostrar.length === 0) {
            listContainer.innerHTML = '<p class="empty-list-msg">Nenhum lembrete para mostrar.</p>';
            return;
        }

        let ultimoDia = null;

        lembretesParaMostrar.forEach(lembrete => {
            const isChecked = lembrete.check;
            const itemClass = isChecked ? 'reminder-item completed' : 'reminder-item';

            // extrai somente yyyy-mm-dd de dataHora
            const diaAtual = lembrete.dataHora.split("T")[0];

            // verifica se o dia mudou
            const addEspacamento = ultimoDia !== null && ultimoDia !== diaAtual;

            const spacerClass = addEspacamento ? "day-separator" : "";

            const itemHTML = `
                <div class="${itemClass} ${spacerClass}" data-id="${lembrete.id}">
                    <div class="col-concluido">
                        <label class="switch">
                            <input type="checkbox" class="toggle-concluido" ${isChecked ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div class="col-data">${formatarDataHora(lembrete.dataHora)}</div>
                    <div class="col-lembrete">${lembrete.titulo}</div>
                    <div class="col-action">
                        <button class="btn-delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            listContainer.innerHTML += itemHTML;

            ultimoDia = diaAtual; // guarda o dia atual
        });
    }
    // -------------------------------
    //      BOTÃO DE FILTRAR STATUS
    // -------------------------------
    if (filterButton) {
        filterButton.addEventListener('click', () => {

            if (filterState === 'all') {
                filterState = 'pending';
                filterButton.classList.add('active');
                filterButton.innerHTML = '<i class="fa-solid fa-filter-circle-xmark"></i> filtro (pendentes)';

            } else if (filterState === 'pending') {
                filterState = 'completed';
                filterButton.classList.add('active');
                filterButton.innerHTML = '<i class="fa-solid fa-filter-circle-check"></i> filtro (concluídos)';

            } else {
                filterState = 'all';
                filterButton.classList.remove('active');
                filterButton.innerHTML = '<i class="fa-solid fa-filter"></i> filtro (todos)';
            }

            carregarLembretes();
        });
    }

    // -------------------------------
    //      EVENTO DO FILTRO DE DATA
    // -------------------------------
    if (filtroData) {
        filtroData.addEventListener('change', () => {
            carregarLembretes();
        });
    }

    // -------------------------------
    //        ADICIONAR LEMBRETE
    // -------------------------------
    if (newReminderForm) {
        newReminderForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const titulo = formTitulo.value.trim();
            const dataHoraRaw = formDataHora.value;
            if (!titulo || !dataHoraRaw) return;

            const newLembrete = {
                titulo,
                conteudo: "Adicionado pelo App",
                dataHora: dataHoraRaw + ":00",
                todoDia: formToggleEday.checked,
                check: false,
                status: "pendente",
                medicamentoId: 1,
                idPessoa: 1
            };

            try {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newLembrete)
                });

                carregarLembretes();
                newReminderForm.reset();
                formDataHora.type = 'text';

            } catch (error) {
                console.error("Erro ao salvar lembrete:", error);
            }
        });
    }

    // -------------------------------
    //  CONCLUIR / EXCLUIR LEMBRETE
    // -------------------------------
    if (listContainer) {
        listContainer.addEventListener('click', async (e) => {
            const reminderItem = e.target.closest('.reminder-item');
            if (!reminderItem) return;

            const id = Number(reminderItem.dataset.id);

            // CONCLUIR
            if (e.target.classList.contains('toggle-concluido')) {
                const isChecked = e.target.checked;
                const novoStatus = isChecked ? "concluido" : "pendente";

                try {
                    await fetch(`${API_URL}/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            check: isChecked,
                            status: novoStatus
                        })
                    });

                    carregarLembretes();
                } catch (error) {
                    console.error("Erro ao atualizar status:", error);
                }
            }

            // EXCLUIR
            if (e.target.closest('.btn-delete')) {
                try {
                    await fetch(`${API_URL}/${id}`, {
                        method: 'DELETE'
                    });

                    carregarLembretes();
                } catch (error) {
                    console.error("Erro ao deletar lembrete:", error);
                }
            }
        });
    }

    // Renderização inicial
    carregarLembretes();

});

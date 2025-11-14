// Espera o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA DO MENU HAMBURGER (DA SUA BASE) ---
    const menuHamburger = document.querySelector('.menu-hamburger');
    const menuContainer = document.querySelector('.menu-container');

    if (menuHamburger && menuContainer) {
        menuHamburger.addEventListener('click', function() {
            this.classList.toggle('aberto');
            menuContainer.classList.toggle('menu-aberto');
        });
    }

    // --- LÓGICA DA PÁGINA DE LEMBRETES (AJUSTADA PARA NOVO JSON) ---

    const API_URL = 'http://localhost:3000/lembretes';
    
    // (MODIFICADO) Lógica do filtro agora tem 3 estados
    let filterState = 'all'; // Opções: 'all', 'pending', 'completed'

    // Elementos do DOM
    const listContainer = document.getElementById('reminder-list-container');
    const filterButton = document.getElementById('btn-filter');
    const newReminderForm = document.getElementById('new-reminder-form');
    
    // Inputs do formulário
    const formDataHora = document.getElementById('form-data-hora');
    const formTitulo = document.getElementById('form-descricao'); 
    const formToggleEday = document.getElementById('form-toggle-eday');


    /**
     * Helper: Formata a data ISO (ex: 2024-09-20T10:00:00) 
     * para o formato de exibição (ex: 20/09 - 10:00)
     */
    function formatarDataHora(isoString) {
        if (!isoString) return "Data inválida";
        try {
            const dataObj = new Date(isoString);
            const dia = String(dataObj.getDate()).padStart(2, '0');
            const mes = String(dataObj.getMonth() + 1).padStart(2, '0'); // Mês começa do 0
            const hora = String(dataObj.getHours()).padStart(2, '0');
            const minuto = String(dataObj.getMinutes()).padStart(2, '0');
            return `${dia}/${mes} - ${hora}:${minuto}`;
        } catch (e) {
            console.error("Erro ao formatar data:", e);
            return "Data inválida";
        }
    }


    /**
     * (MODIFICADO) Função para carregar os lembretes da API
     */
    async function carregarLembretes() {
        if (!listContainer) return;

        // (MODIFICADO) Monta a URL com base no filterState
        let url = `${API_URL}?_sort=id&_order=desc`; // Começa com a ordenação

        if (filterState === 'pending') {
            url += '&check=false'; // Filtra por pendentes
        } else if (filterState === 'completed') {
            url += '&check=true'; // Filtra por concluídos
        }
        // Se for 'all', não adiciona filtro de 'check'

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Falha ao carregar lembretes');
            
            const lembretes = await response.json();
            renderLembretes(lembretes); // Chama a função de renderização
        
        } catch (error) {
            console.error(error);
            listContainer.innerHTML = '<p class="empty-list-msg">Erro ao carregar lembretes.</p>';
        }
    }


    /**
     * (MODIFICADO) Função para renderizar a lista
     */
    function renderLembretes(lembretesParaMostrar) {
        listContainer.innerHTML = '';

        if (lembretesParaMostrar.length === 0) {
            listContainer.innerHTML = '<p class="empty-list-msg">Nenhum lembrete para mostrar.</p>';
            return;
        }

        lembretesParaMostrar.forEach(lembrete => {
            const isChecked = lembrete.check; 
            const itemClass = isChecked ? 'reminder-item completed' : 'reminder-item';
            
            const itemHTML = `
                <div class="${itemClass}" data-id="${lembrete.id}">
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
        });
    }

    /**
     * (MODIFICADO) Event Listener para o botão FILTRAR (8)
     */
    if (filterButton) {
        filterButton.addEventListener('click', () => {
            // (MODIFICADO) Clica pelos 3 estados
            if (filterState === 'all') {
                filterState = 'pending';
                filterButton.classList.add('active');
                filterButton.innerHTML = '<i class="fa-solid fa-filter-circle-xmark"></i> filtro (pendentes)';
            
            } else if (filterState === 'pending') {
                filterState = 'completed';
                filterButton.classList.add('active'); // Mantém ativo
                filterButton.innerHTML = '<i class="fa-solid fa-filter-circle-check"></i> filtro (concluídos)'; // Novo ícone
            
            } else { // era 'completed'
                filterState = 'all';
                filterButton.classList.remove('active');
                filterButton.innerHTML = '<i class="fa-solid fa-filter"></i> filtro (todos)';
            }
            
            carregarLembretes(); // Recarrega os dados da API com o novo filtro
        });
    }

    /**
     * Event Listener para o formulário de NOVO LEMBRETE (5)
     */
    if (newReminderForm) {
        newReminderForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const titulo = formTitulo.value.trim();
            const dataHoraRaw = formDataHora.value; 

            if (!titulo || !dataHoraRaw) return;

            const dataHoraISO = dataHoraRaw + ":00"; 
            const todoDiaValue = formToggleEday.checked; 

            const newLembrete = {
                titulo: titulo,
                conteudo: "Adicionado pelo App", 
                dataHora: dataHoraISO,
                todoDia: todoDiaValue,
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

    /**
     * Event Listener para CONCLUIR (2) e EXCLUIR (4)
     */
    if (listContainer) {
        listContainer.addEventListener('click', async (e) => {
            const reminderItem = e.target.closest('.reminder-item');
            if (!reminderItem) return;

            const id = Number(reminderItem.dataset.id);

            // Ação: CONCLUIR (PATCH)
            if (e.target.classList.contains('toggle-concluido')) {
                const isChecked = e.target.checked; // true ou false
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
                    
                    carregarLembretes(); // Recarrega para aplicar o filtro (se necessário)

                } catch (error) {
                    console.error("Erro ao atualizar status:", error);
                }
            }

            // Ação: EXCLUIR (DELETE)
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

    // --- Renderização Inicial ---
    carregarLembretes();

});
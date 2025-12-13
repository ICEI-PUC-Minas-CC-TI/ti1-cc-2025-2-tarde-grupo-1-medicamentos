
const notificationIcon = document.getElementById('notification-icon');
const notificationDropdown = document.getElementById('notification-dropdown');
const notificationList = document.getElementById('notification-list');
const notificationCount = document.getElementById('notification-count');
const notificationSound = document.getElementById('notification-sound'); 

const API_URL_LEMBRETES = "/lembretes";
let alarmesDisparados = new Set(); 

async function carregarNotificacoes() {
    try {
        const resposta = await fetch(API_URL_LEMBRETES);
        const dados = await resposta.json();

        let pendentes = dados.filter(l => l.check === false);
      
        pendentes.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

        renderizarNotificacoes(pendentes);
        verificarAlarme(pendentes);

    } catch (erro) {
        console.error("Erro notificacao:", erro);
    }
}

function renderizarNotificacoes(lista) {
    if (notificationCount) {
        notificationCount.style.display = lista.length > 0 ? 'flex' : 'none';
        notificationCount.textContent = lista.length > 9 ? '9+' : lista.length;
    }

    if (!notificationList) return;
    notificationList.innerHTML = '';

    if (lista.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-empty" style="display:flex; flex-direction:column; gap:5px">
                <span class="emoji">🎉</span>
                <p>Nenhum lembrete pendente</p>
            </div>`;
        return;
    }

    const agora = new Date();

    lista.forEach(item => {
        const dataItem = new Date(item.dataHora);
        const isAtrasado = dataItem < agora;
        
        
        const horaStr = dataItem.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const diaStr = dataItem.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        const classeBadge = isAtrasado ? 'time-badge atrasado' : 'time-badge';
        const textoStatus = isAtrasado ? 'Atrasado' : 'Agendado';

        const html = `
            <div class="notification-item">
                <div class="notification-info" onclick="clicarNotificacao(${item.id})">
                    <div class="notification-title">${item.titulo}</div>
                    <span class="${classeBadge}">
                        ${textoStatus}: ${diaStr} às ${horaStr}
                    </span>
                    <div class="notification-content">${item.conteudo}</div>
                </div>

                <button class="btn-check" title="Marcar como concluído" onclick="concluirLembrete(${item.id}, event)">
                    ✔
                </button>
            </div>
        `;
        notificationList.innerHTML += html;
    });
}

async function concluirLembrete(id, event) {

    event.stopPropagation(); 


    const btn = event.target.closest('.btn-check');
    btn.innerHTML = '⌛'; 
    
    try {

        const resposta = await fetch(`${API_URL_LEMBRETES}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ check: true, status: 'concluido' })
        });

        if (resposta.ok) {

            carregarNotificacoes();
            

            if (typeof pegarlemenbretes === 'function') { 
                pegarlemenbretes(); 
            }
        } else {
            alert("Erro ao concluir lembrete.");
        }
    } catch (erro) {
        console.error("Erro ao concluir:", erro);
        alert("Erro de conexão.");
    }
}

function verificarAlarme(pendentes) {
    const agora = new Date();
    pendentes.forEach(item => {
        const dataItem = new Date(item.dataHora);
        const diff = Math.abs(agora - dataItem);
        
        if (diff < 60000 && !alarmesDisparados.has(item.id)) {
            if (notificationSound) {
                notificationSound.currentTime = 0;
                notificationSound.play().catch(e => {});
            }
            alarmesDisparados.add(item.id);
        }
    });
}

function clicarNotificacao(id) {
    console.log("Clicou no ID:", id);
}

function init() {
    if(notificationIcon && notificationDropdown) {
        notificationIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
            if(notificationDropdown.classList.contains('show')) carregarNotificacoes();
        });

        document.addEventListener('click', (e) => {
            if(!notificationDropdown.contains(e.target) && e.target !== notificationIcon) {
                notificationDropdown.classList.remove('show');
            }
        });
    }
    carregarNotificacoes();
    setInterval(carregarNotificacoes, 30000);
}

document.addEventListener('DOMContentLoaded', init);
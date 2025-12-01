const API_URL = "http://localhost:3000/medicamentos";

document.addEventListener('DOMContentLoaded', function () {
    carregarDetalhesMedicamento();
});

async function carregarDetalhesMedicamento() {
    const urlParams = new URLSearchParams(window.location.search);
    const medicamentoId = urlParams.get('id');

    if (!medicamentoId) {
        mostrarErro('ID do medicamento não encontrado na URL.');
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${medicamentoId}`);

        if (!resposta.ok) {
            throw new Error('Medicamento não encontrado');
        }

        const medicamento = await resposta.json();
        exibirDetalhes(medicamento);

    } catch (erro) {
        console.error('Erro ao carregar detalhes:', erro);
        mostrarErro('Erro ao carregar detalhes do medicamento.');
    }
}

function exibirDetalhes(medicamento) {
    const container = document.getElementById('detalhes-medicamento');

    const detalhesHTML = `
        <div class="card-detalhes">
            <div class="cabecalho-detalhes">
                <div class="imagem-titulo">
                    <img src="${medicamento.imagem || './assets/images/medicamentos/padrao.jpg'}" 
                         alt="${medicamento.nome}" 
                         class="imagem-grande"
                         onerror="this.src='./assets/images/medicamentos/padrao.jpg'">
                    <div>
                        <h1>${medicamento.nome}</h1>
                        <span class="badge-tipo">${medicamento.tipo || 'Medicamento'}</span>
                    </div>
                </div>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Dosagem:</span>
                    <span class="info-value">${medicamento.dose}</span>
                </div>
                
                <div class="info-item">
                    <span class="info-label">Intervalo:</span>
                    <span class="info-value">${medicamento.intervalo}</span>
                </div>
                
                <div class="info-item">
                    <span class="info-label">Doses por embalagem:</span>
                    <span class="info-value">${medicamento.dosePorEmbalagem || 'Não informado'}</span>
                </div>
                
                <div class="info-item">
                    <span class="info-label">Status:</span>
                    <span class="info-value status-${medicamento.status}">${medicamento.status === 'ativo' ? 'Ativo' : 'Inativo'}</span>
                </div>
            </div>

            <div class="preco-section">
                <h3>Preço Médio</h3>
                <div class="preco-valor">R$ ${gerarPrecoAleatorio()}</div>
                <small>*Preço pode variar conforme a farmácia</small>
            </div>

            <div class="acoes-detalhes">
                <button class="btn-editar" onclick="editarMedicamento(${medicamento.id})">
                    Editar Medicamento
                </button>
                <button class="btn-excluir" onclick="excluirMedicamento(${medicamento.id})">
                    Excluir Medicamento
                </button>
            </div>
        </div>
    `;

    container.innerHTML = detalhesHTML;
}

function gerarPrecoAleatorio() {
    const precos = ['8,90 - 15,90', '12,50 - 22,00', '15,90 - 25,90', '18,00 - 28,50', '25,90 - 35,90'];
    return precos[Math.floor(Math.random() * precos.length)];
}

function mostrarErro(mensagem) {
    const container = document.getElementById('detalhes-medicamento');
    container.innerHTML = `
        <div class="erro-detalhes">
            <h2>Erro</h2>
            <p>${mensagem}</p>
            <a href="index.html" class="btn-voltar">Voltar para lista</a>
        </div>
    `;
}

function editarMedicamento(id) {
    window.location.href = `index.html?edit=${id}`;
}

function excluirMedicamento(id) {
    if (confirm('Tem certeza que deseja excluir este medicamento?')) {
        fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert('Medicamento excluído com sucesso!');
                    window.location.href = 'index.html';
                } else {
                    alert('Erro ao excluir medicamento!');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao excluir medicamento!');
            });
    }
}
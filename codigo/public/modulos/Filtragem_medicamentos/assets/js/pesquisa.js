// pesquisa.js - Funcionalidade de pesquisa separada
document.addEventListener('DOMContentLoaded', function() {
    // Elementos da pesquisa
    const btnAbrir = document.getElementById('btn-abrir-pesquisa');
    const overlay = document.getElementById('overlay-pesquisa');
    const btnFechar = document.getElementById('btn-fechar-pesquisa');
    const inputPesquisa = document.getElementById('input-pesquisa');
    const resultados = document.getElementById('resultados-pesquisa');

    // Verificar se elementos existem
    if (!btnAbrir || !overlay) {
        console.log('Elementos de pesquisa não encontrados');
        return;
    }

    // Abrir pesquisa
    btnAbrir.addEventListener('click', function() {
        overlay.style.display = 'block';
        setTimeout(() => {
            overlay.classList.add('ativo');
            inputPesquisa.focus();
        }, 10);
        mostrarSugestoes();
    });

    // Fechar pesquisa
    btnFechar.addEventListener('click', fecharPesquisa);

    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharPesquisa();
        }
    });

    // Fechar ao clicar fora
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            fecharPesquisa();
        }
    });

    // Pesquisar ao digitar
    inputPesquisa.addEventListener('input', function(e) {
        const termo = e.target.value.trim();
        if (termo.length > 1) {
            buscarMedicamentos(termo);
        } else {
            mostrarSugestoes();
        }
    });

    function fecharPesquisa() {
        overlay.classList.remove('ativo');
        setTimeout(() => {
            overlay.style.display = 'none';
            inputPesquisa.value = '';
            resultados.innerHTML = '';
        }, 300);
    }

    function buscarMedicamentos(termo) {
        // Simulação de busca - depois conecte com sua API
        const medicamentosExemplo = [
            { nome: "Dipirona 500mg", dose: "500mg", tipo: "Comprimido", laboratorio: "Genérico", preco: "R$ 8,90 - 15,90" },
            { nome: "Paracetamol 750mg", dose: "750mg", tipo: "Comprimido", laboratorio: "Genérico", preco: "R$ 12,50 - 22,00" },
            { nome: "Ibuprofeno 400mg", dose: "400mg", tipo: "Comprimido", laboratorio: "Genérico", preco: "R$ 15,90 - 25,90" },
            { nome: "Amoxicilina 500mg", dose: "500mg", tipo: "Cápsula", laboratorio: "Genérico", preco: "R$ 18,00 - 28,50" },
            { nome: "Omeprazol 20mg", dose: "20mg", tipo: "Cápsula", laboratorio: "Genérico", preco: "R$ 25,90 - 35,90" }
        ];

        const resultadosFiltrados = medicamentosExemplo.filter(med => 
            med.nome.toLowerCase().includes(termo.toLowerCase())
        );

        exibirResultados(resultadosFiltrados, termo);
    }

    function exibirResultados(resultadosArray, termo) {
        if (resultadosArray.length === 0) {
            resultados.innerHTML = `
                <div class="resultado-vazio">
                    Nenhum medicamento encontrado para "${termo}"
                </div>
            `;
            return;
        }

        const htmlResultados = resultadosArray.map(med => `
            <div class="item-resultado">
                <div class="nome-remedio">${med.nome}</div>
                <div class="info-dosagem">
                    <span class="dosagem">${med.dose}</span>
                    <span class="preco-medio">${med.preco}</span>
                </div>
                <div class="info-laboratorio">
                    <span class="laboratorio">${med.laboratorio}</span>
                    <span class="tipo">${med.tipo}</span>
                </div>
            </div>
        `).join('');

        resultados.innerHTML = htmlResultados;
    }

    function mostrarSugestoes() {
        resultados.innerHTML = `
            <div class="sugestoes">
                <div class="titulo-sugestoes">Sugestões de busca:</div>
                <div class="lista-sugestoes">
                    <div class="sugestao" data-termo="Dipirona">Dipirona</div>
                    <div class="sugestao" data-termo="Paracetamol">Paracetamol</div>
                    <div class="sugestao" data-termo="Ibuprofeno">Ibuprofeno</div>
                    <div class="sugestao" data-termo="Amoxicilina">Amoxicilina</div>
                </div>
            </div>
        `;

        // Adicionar eventos às sugestões
        document.querySelectorAll('.sugestao').forEach(sugestao => {
            sugestao.addEventListener('click', function() {
                const termo = this.getAttribute('data-termo');
                inputPesquisa.value = termo;
                buscarMedicamentos(termo);
            });
        });
    }
});
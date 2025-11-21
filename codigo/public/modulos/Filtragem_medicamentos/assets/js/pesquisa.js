document.addEventListener('DOMContentLoaded', function () {
    const btnAbrir = document.getElementById('btn-abrir-pesquisa');
    const overlay = document.getElementById('overlay-pesquisa');
    const btnFechar = document.getElementById('btn-fechar-pesquisa');
    const inputPesquisa = document.getElementById('input-pesquisa');
    const resultados = document.getElementById('resultados-pesquisa');

    if (!btnAbrir || !overlay) {
        console.log('Elementos de pesquisa não encontrados');
        return;
    }

    btnAbrir.addEventListener('click', function () {
        overlay.style.display = 'block';
        setTimeout(() => {
            overlay.classList.add('ativo');
            inputPesquisa.focus();
        }, 10);
        mostrarSugestoes();
    });

    btnFechar.addEventListener('click', fecharPesquisa);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            fecharPesquisa();
        }
    });

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            fecharPesquisa();
        }
    });

    inputPesquisa.addEventListener('input', function (e) {
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

    async function buscarMedicamentos(termo) {
        try {
            const resposta = await fetch('http://localhost:3000/medicamentos');
            const medicamentos = await resposta.json();

            const resultadosFiltrados = medicamentos.filter(med => {
                const nomeMatch = med.nome?.toLowerCase().includes(termo.toLowerCase());
                const tipoMatch = med.tipo?.toLowerCase().includes(termo.toLowerCase());
                const doseMatch = med.dose?.toLowerCase().includes(termo.toLowerCase());

                return nomeMatch || tipoMatch || doseMatch;
            });

            exibirResultados(resultadosFiltrados, termo);
        } catch (erro) {
            console.error("Erro na pesquisa:", erro);
            const medicamentosExemplo = [
                { id: 1, nome: "Amoxicilina 500mg", dose: "500mg", tipo: "Antibiótico", laboratorio: "Genérico", preco: "R$ 18,00 - 28,50" },
                { id: 2, nome: "Azitromicina 500mg", dose: "500mg", tipo: "Antibiótico", laboratorio: "Genérico", preco: "R$ 25,90 - 35,90" },
                { id: 3, nome: "Dipirona 500mg", dose: "500mg", tipo: "Analgésico", laboratorio: "Genérico", preco: "R$ 8,90 - 15,90" },
                { id: 4, nome: "Paracetamol 750mg", dose: "750mg", tipo: "Analgésico", laboratorio: "Genérico", preco: "R$ 12,50 - 22,00" },
                { id: 5, nome: "Ibuprofeno 400mg", dose: "400mg", tipo: "Anti-inflamatório", laboratorio: "Genérico", preco: "R$ 15,90 - 25,90" },
                { id: 6, nome: "Omeprazol 20mg", dose: "20mg", tipo: "Antiácido", laboratorio: "Genérico", preco: "R$ 25,90 - 35,90" }
            ];

            const resultadosFiltrados = medicamentosExemplo.filter(med => {
                const nomeMatch = med.nome?.toLowerCase().includes(termo.toLowerCase());
                const tipoMatch = med.tipo?.toLowerCase().includes(termo.toLowerCase());
                const doseMatch = med.dose?.toLowerCase().includes(termo.toLowerCase());

                return nomeMatch || tipoMatch || doseMatch;
            });

            exibirResultados(resultadosFiltrados, termo);
        }
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
            <div class="item-resultado" data-id="${med.id}">
                <div class="resultado-com-imagem">
                    <img src="${med.imagem || './assets/images/medicamentos/padrao.jpg'}" 
                        alt="${med.nome}" 
                        class="imagem-remedio"
                        onerror="this.src='./assets/images/medicamentos/padrao.jpg'">
                    <div class="resultado-info">
                        <strong>${med.nome}</strong>
                        <span>${med.dose} - ${med.intervalo}</span>
                        <span class="tipo-remedio">${med.tipo || 'Medicamento'}</span>
                    </div>
                </div>
            </div>
    `).join('');

        resultados.innerHTML = htmlResultados;


        document.querySelectorAll('.item-resultado').forEach(item => {
            item.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                selecionarMedicamento(id);
            });
        });
    }

    function selecionarMedicamento(id) {
        console.log('Medicamento selecionado ID:', id);
        window.location.href = `detalhes.html?id=${id}`;
        fecharPesquisa();
    }

    function mostrarSugestoes() {
        resultados.innerHTML = `
            <div class="sugestoes">
                <div class="titulo-sugestoes">Sugestões de busca:</div>
                <div class="lista-sugestoes">
                    <div class="sugestao" data-termo="Dipirona">Dipirona</div>
                    <div class="sugestao" data-termo="Paracetamol">Paracetamol</div>
                    <div class="sugestao" data-termo="Antibiótico">Antibiótico</div>
                    <div class="sugestao" data-termo="Analgésico">Analgésico</div>
                </div>
            </div>
        `;

        document.querySelectorAll('.sugestao').forEach(sugestao => {
            sugestao.addEventListener('click', function () {
                const termo = this.getAttribute('data-termo');
                inputPesquisa.value = termo;
                buscarMedicamentos(termo);
            });
        });
    }
});
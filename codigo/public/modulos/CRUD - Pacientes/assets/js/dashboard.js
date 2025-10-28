// Dashboard com gráficos e estatísticas

// EVENTO 1: onload - Carregar dados iniciais
async function carregarDadosIniciais() {
    await carregarEstatisticas();
    iniciarContadorVisitas();
    atualizarStatusSistema();
}

// Carregar estatísticas da API
async function carregarEstatisticas() {
    try {
        const response = await fetch('http://localhost:3001/pacientes');
        
        if (response.ok) {
            const pacientes = await response.json();
            atualizarEstatisticas(pacientes);
            criarGraficos(pacientes);
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        document.getElementById('status-sistema').textContent = 'Offline';
        document.getElementById('status-sistema').style.color = '#dc3545';
    }
}

// Atualizar estatísticas na página inicial
function atualizarEstatisticas(pacientes) {
    document.getElementById('total-pacientes').textContent = pacientes.length;
    
    // Calcular distribuição por tipo
    const tipos = {
        pessoa: pacientes.filter(p => p.tipo === 'pessoa').length,
        dependente: pacientes.filter(p => p.tipo === 'dependente').length,
        idoso: pacientes.filter(p => p.tipo === 'idoso').length
    };
    
    // Atualizar status do sistema
    document.getElementById('status-sistema').textContent = '100%';
    document.getElementById('status-sistema').style.color = '#28a745';
}

// Criar gráficos com Chart.js
function criarGraficos(pacientes) {
    // Gráfico de distribuição por tipo
    const ctxTipo = document.getElementById('chartTipo').getContext('2d');
    const tipos = {
        pessoa: pacientes.filter(p => p.tipo === 'pessoa').length,
        dependente: pacientes.filter(p => p.tipo === 'dependente').length,
        idoso: pacientes.filter(p => p.tipo === 'idoso').length
    };
    
    new Chart(ctxTipo, {
        type: 'doughnut',
        data: {
            labels: ['Pessoas', 'Dependentes', 'Idosos'],
            datasets: [{
                data: [tipos.pessoa, tipos.dependente, tipos.idoso],
                backgroundColor: [
                    '#69B7BF',
                    '#5E848C',
                    '#3A5A66'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Gráfico de distribuição por faixa etária
    const ctxIdade = document.getElementById('chartIdade').getContext('2d');
    const faixasEtarias = {
        crianca: pacientes.filter(p => p.idade <= 12).length,
        adolescente: pacientes.filter(p => p.idade > 12 && p.idade <= 17).length,
        adulto: pacientes.filter(p => p.idade > 17 && p.idade <= 59).length,
        idoso: pacientes.filter(p => p.idade >= 60).length
    };
    
    new Chart(ctxIdade, {
        type: 'bar',
        data: {
            labels: ['Crianças (0-12)', 'Adolescentes (13-17)', 'Adultos (18-59)', 'Idosos (60+)'],
            datasets: [{
                label: 'Quantidade de Pacientes',
                data: [faixasEtarias.crianca, faixasEtarias.adolescente, faixasEtarias.adulto, faixasEtarias.idoso],
                backgroundColor: '#69B7BF',
                borderColor: '#5E848C',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Contador de visitas (localStorage)
function iniciarContadorVisitas() {
    let visitas = localStorage.getItem('visitas-cuidamed') || 0;
    visitas = parseInt(visitas) + 1;
    localStorage.setItem('visitas-cuidamed', visitas);
    document.getElementById('contador-visitas').textContent = `Visitas: ${visitas}`;
}

// Atualizar status do sistema
function atualizarStatusSistema() {
    setInterval(async () => {
        try {
            const response = await fetch('http://localhost:3001/pacientes');
            if (response.ok) {
                document.getElementById('status-sistema').textContent = '100%';
                document.getElementById('status-sistema').style.color = '#28a745';
            }
        } catch (error) {
            document.getElementById('status-sistema').textContent = 'Offline';
            document.getElementById('status-sistema').style.color = '#dc3545';
        }
    }, 30000); // Verificar a cada 30 segundos
}
const cardContainer = document.querySelector(".card-container");
const formCadastro = document.getElementById("form-cadastro");
const nomeInput = document.getElementById("nome");
const doseInput = document.getElementById("dose");
const intervaloInput = document.getElementById("intervalo");
const imagemInput = document.getElementById("imagemInput");
const previewImagem = document.getElementById("preview-imagem");
const editIdInput = document.getElementById("edit-id"); 
const formButton = document.getElementById("btn-submit");
const usoDiarioInput = document.getElementById("usoDiarioInput");

let API_URL = "/medicamentos";
let imagemPreviewAtual = ""; 

function iniciarMenuMobile() {
    const btnHamburger = document.getElementById('btn-hamburger');
    const btnFechar = document.getElementById('btn-fechar-menu');
    const navMenu = document.getElementById('nav-menu');

    if (btnHamburger && navMenu) {
        btnHamburger.addEventListener('click', () => {
            navMenu.classList.add('menu-aberto');
        });
    }

    if (btnFechar && navMenu) {
        btnFechar.addEventListener('click', () => {
            navMenu.classList.remove('menu-aberto');
        });
    }

    if (navMenu) {
        const linksMenu = navMenu.querySelectorAll('a');
        linksMenu.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => {
                    navMenu.classList.remove('menu-aberto');
                }, 100); 
            });
        });
        
        const menuItemsWithSub = navMenu.querySelectorAll('.menu-item > a[href="#"]');
        menuItemsWithSub.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault(); 
                const subMenu = item.nextElementSibling;
                if (subMenu && subMenu.tagName === 'UL') {
                    if (subMenu.style.display === 'block') {
                        subMenu.style.display = 'none';
                    } else {
                        navMenu.querySelectorAll('.menu-item > ul').forEach(ul => {
                            if (ul !== subMenu) ul.style.display = 'none';
                        });
                        subMenu.style.display = 'block';
                    }
                }
            });
        });
    }
}

if(imagemInput) {
    imagemInput.addEventListener('change', function(event) {
        const arquivo = event.target.files[0];
        if (arquivo) {
            const reader = new FileReader();
            reader.onloadend = function() {
                imagemPreviewAtual = reader.result; 
                previewImagem.src = imagemPreviewAtual;
                previewImagem.style.display = 'block';
            }
            reader.readAsDataURL(arquivo);
        }
    });
}


async function pegarmedicamentos() {
    try {
        const resposta = await fetch(API_URL);
        const dados = await resposta.json();

        const isPageGerenciamento = !!formCadastro;

        let dadosFiltrados = dados;

        if (!isPageGerenciamento) {

            dadosFiltrados = dados.filter(med => med.usoDiario === true);
        }


        dadosFiltrados.sort((a, b) => {
            if (a.check && !b.check) return 1;
            if (!a.check && b.check) return -1;
            return 0;
        });

        renderizarCards(dadosFiltrados, isPageGerenciamento);

    } catch (erro) {
        console.error("Erro ao carregar medicamentos:", erro);
        if(cardContainer) {
            cardContainer.innerHTML = '<p style="color: red; padding: 20px;">Não foi possível carregar os dados. Verifique o JSON Server.</p>';
        }
    }
}

function renderizarCards(listaMedicamentos, permitirEdicao) {
    const isInModules = window.location.pathname.includes('/modulos/');
    const basePath = isInModules ? '../../assets' : './assets';

    let listaHTML = '';
    
    if (listaMedicamentos.length === 0) {
        listaHTML = `<div style="padding:20px; text-align:center; color:#666;">Nenhum medicamento encontrado para exibição.</div>`;
    }

    listaMedicamentos.forEach((med) => {
        const checkIcon = med.check 
            ? `<img src="${basePath}/images/check.png" alt="Concluído" style="width: 20px; height: 20px;">` 
            : ''; 
        
        const concluidoClass = med.check ? 'concluido' : '';
        
        let imagemSrc;
        if (med.imagem && med.imagem.startsWith('data:image')) {
            imagemSrc = med.imagem;
        } else if (med.imagem) {
             const caminhoLimpo = med.imagem.startsWith('.') ? med.imagem.substring(1) : med.imagem;
             const caminhoComBarra = caminhoLimpo.startsWith('/') ? caminhoLimpo : '/' + caminhoLimpo;
             imagemSrc = `${basePath}${caminhoComBarra}`;
        } else {
            imagemSrc = `${basePath}/images/produtos/Remedio1.png`;
        }

        let botoesAcao = '';
        if (permitirEdicao) {
            botoesAcao = `
            <div class="buttons-card">
                <img src="${basePath}/images/lapis.png" alt="Editar" class="btn-editar-card" data-id="${med.id}" title="Editar">
                <img src="${basePath}/images/lixeira.png" alt="Excluir" class="btn-excluir-card" data-id="${med.id}" title="Excluir">
            </div>`;
        } else {
            botoesAcao = `<div class="buttons-card"></div>`;
        }

        listaHTML += `
        <div class="card ${concluidoClass}">
            <div class="check-area" data-id="${med.id}" data-check="${med.check}">
                ${checkIcon}
            </div>
            <p class="horario" title="${med.intervalo}">${med.intervalo}</p>
            <div style="display:flex; align-items:center; gap:5px; overflow:hidden;"> 
                <img src="${imagemSrc}" style="width:25px; height:25px; border-radius:50%; object-fit:cover;" 
                    onerror="this.src='${basePath}/images/produtos/Remedio1.png'">
                <p class="nome" title="${med.nome}">${med.nome}</p>
            </div>
            <p class="dose" title="${med.dose}">${med.dose}</p>
            ${botoesAcao}
        </div>
        `;
    });
    
    if(cardContainer) {
         cardContainer.innerHTML = listaHTML;
         adicionarListenersAcoes();
    }
}

async function submitForm(event) {
    event.preventDefault();

    const id = editIdInput.value;
    const isEdit = !!id; 

    const medicamento = {
        nome: nomeInput.value,
        dose: doseInput.value,
        intervalo: intervaloInput.value,
        usoDiario: usoDiarioInput ? usoDiarioInput.checked : false,
        imagem: imagemPreviewAtual || (isEdit ? (await buscarMedicamentoPorId(id)).imagem : ''),
        check: isEdit ? (await buscarMedicamentoPorId(id)).check : false 
    };

    try {
        if (isEdit) {
            await editarMedicamento(id, medicamento);
            alert("Medicamento atualizado com sucesso!");
        } else {
            await adicionarMedicamento(medicamento);
            alert("Medicamento cadastrado com sucesso!");
        }
        
        resetForm();
        pegarmedicamentos();
    } catch (erro) {
        console.error("Erro ao salvar medicamento:", erro);
        alert(`Erro ao salvar: ${erro.message}`);
    }
}

async function adicionarMedicamento(medicamento) {
    const resposta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicamento)
    });
    if (!resposta.ok) throw new Error("Falha ao adicionar medicamento.");
}

async function editarMedicamento(id, medicamento) {
    const resposta = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicamento)
    });
    if (!resposta.ok) throw new Error("Falha ao editar medicamento.");
}

async function deletarMedicamento(id) {
    if (!confirm("Tem certeza que deseja excluir este medicamento?")) return;
    
    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!resposta.ok) throw new Error("Falha ao excluir medicamento.");

        alert("Medicamento excluído com sucesso!");
        pegarmedicamentos(); 
    } catch (erro) {
        console.error("Erro ao deletar medicamento:", erro);
        alert(`Erro ao excluir: ${erro.message}`);
    }
}

async function toggleCheck(id, currentCheck) {
    try {
        const newCheckStatus = !currentCheck;
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ check: newCheckStatus })
        });

        if (!resposta.ok) throw new Error("Falha ao atualizar status.");

        pegarmedicamentos(); 
    } catch (erro) {
        console.error("Erro ao alternar status check:", erro);
        alert(`Erro: ${erro.message}`);
    }
}

async function preencherFormularioEdicao(id) {
    try {
        const medicamento = await buscarMedicamentoPorId(id);
        
        nomeInput.value = medicamento.nome;
        doseInput.value = medicamento.dose;
        intervaloInput.value = medicamento.intervalo;
        
        editIdInput.value = medicamento.id; 
        
        if(usoDiarioInput) {
            usoDiarioInput.checked = (medicamento.usoDiario === true);
        }

        formButton.textContent = "Atualizar";
        
        imagemPreviewAtual = medicamento.imagem;
        previewImagem.src = medicamento.imagem || '';
        previewImagem.style.display = medicamento.imagem ? 'block' : 'none';

        const formSection = document.querySelector('.form-container');
        if(formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (erro) {
        console.error("Erro ao carregar dados para edição:", erro);
        alert(`Erro ao carregar: ${erro.message}`);
    }
}

async function buscarMedicamentoPorId(id) {
    const resposta = await fetch(`${API_URL}/${id}`);
    if (!resposta.ok) throw new Error("Erro ao buscar dados do medicamento.");
    return await resposta.json();
}

function resetForm() {
    if(!formCadastro) return;
    
    formCadastro.reset();
    editIdInput.value = '';
    formButton.textContent = "Salvar";
    previewImagem.src = '';
    previewImagem.style.display = 'none';
    imagemPreviewAtual = '';
    
    if(usoDiarioInput) usoDiarioInput.checked = false;
}

function adicionarListenersAcoes() {
    document.querySelectorAll('.check-area').forEach(checkArea => {
        checkArea.onclick = () => {
            const id = checkArea.dataset.id;
            const currentCheck = checkArea.dataset.check === 'true';
            toggleCheck(id, currentCheck);
        };
    });

    document.querySelectorAll('.btn-editar-card').forEach(btn => {
        btn.onclick = () => {
            preencherFormularioEdicao(btn.dataset.id);
        };
    });

    document.querySelectorAll('.btn-excluir-card').forEach(btn => {
        btn.onclick = () => {
            deletarMedicamento(btn.dataset.id);
        };
    });
}

function initializeApp() {
    iniciarMenuMobile();
    pegarmedicamentos(); 
    
    if (formCadastro) {
        formCadastro.addEventListener('submit', submitForm);
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
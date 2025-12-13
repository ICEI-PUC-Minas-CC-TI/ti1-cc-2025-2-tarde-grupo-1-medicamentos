document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacaoPerfil();
});

const API_URL_USUARIOS_PERFIL = '/usuarios';

function verificarAutenticacaoPerfil() {
    const usuarioSalvo = sessionStorage.getItem('usuarioCorrente');
    
    if (!usuarioSalvo) {
        alert("Você precisa estar logado para acessar esta página.");
        window.location.href = '../../login/login.html'; 
        return;
    }

    const usuario = JSON.parse(usuarioSalvo);
    carregarDadosFormulario(usuario);
}

function carregarDadosFormulario(usuario) {
    document.getElementById('perfil-nome').value = usuario.nome || '';
    document.getElementById('perfil-email').value = usuario.email || '';
    document.getElementById('perfil-login').value = usuario.login || '';
    document.getElementById('perfil-senha').value = usuario.senha || '';
}

const formPerfil = document.getElementById('form-perfil');
if (formPerfil) {
    formPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usuarioSalvo = JSON.parse(sessionStorage.getItem('usuarioCorrente'));
        if (!usuarioSalvo || !usuarioSalvo.id) {
            alert("Erro de sessão. Faça login novamente.");
            return;
        }

        const dadosAtualizados = {
            id: usuarioSalvo.id, 
            nome: document.getElementById('perfil-nome').value,
            email: document.getElementById('perfil-email').value,
            login: document.getElementById('perfil-login').value, 
            senha: document.getElementById('perfil-senha').value
        };

        try {
            await atualizarUsuarioNaAPI(dadosAtualizados);
        } catch (erro) {
            console.error(erro);
            alert("Erro ao atualizar perfil.");
        }
    });
}

async function atualizarUsuarioNaAPI(usuario) {
    const resposta = await fetch(`${API_URL_USUARIOS_PERFIL}/${usuario.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
    });

    if (resposta.ok) {
        sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuario));
        alert("Dados atualizados com sucesso!");
        window.location.reload(); 
    } else {
        throw new Error("Erro na API");
    }
}
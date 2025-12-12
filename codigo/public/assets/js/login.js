const API_URL_USUARIOS = 'http://localhost:3000/usuarios';

var db_usuarios = [];
var usuarioCorrente = {};

async function initLoginApp() {
    verificarPermissaoAcesso();

    await carregarUsuarios();

    const usuarioSalvo = sessionStorage.getItem('usuarioCorrente');
    if (usuarioSalvo) {
        try {
            usuarioCorrente = JSON.parse(usuarioSalvo);
        } catch (e) {
            logoutUser();
        }
    }

    atualizarInterfaceUsuario();
    configurarFormulariosAutenticacao();
}

function verificarPermissaoAcesso() {
    const usuarioLogado = sessionStorage.getItem('usuarioCorrente');
    const isLoginPage = window.location.pathname.includes('login.html');

    if (!usuarioLogado && !isLoginPage) {
        const pathLogin = resolverCaminhoParaLogin();
        if (pathLogin !== '#') {
            sessionStorage.setItem('returnURL', window.location.href);
            window.location.href = pathLogin;
        }
    }

    if (usuarioLogado && isLoginPage) {
        window.location.href = resolverCaminhoParaHome();
    }
}

async function carregarUsuarios() {
    try {
        const response = await fetch(API_URL_USUARIOS);
        db_usuarios = await response.json();
    } catch (err) {
        console.error(err);
    }
}

function configurarFormulariosAutenticacao() {
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const loginInput = document.getElementById('login-usuario').value; 
            const senhaInput = document.getElementById('senha-usuario').value;
            loginUser(loginInput, senhaInput);
        });
    }

    const formRegister = document.getElementById('form-register-user');
    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('reg-nome').value;
            const login = document.getElementById('reg-login').value;
            const senha = document.getElementById('reg-senha').value;
            const email = document.getElementById('reg-email').value;
            addUser(nome, login, senha, email);
        });
    }
}

function loginUser(login, senha) {
    if (db_usuarios.length === 0) {
        alert("Aguarde o carregamento do sistema...");
        return false;
    }

    const user = db_usuarios.find(u => u.login === login && u.senha === senha);
    
    if (user) {
        usuarioCorrente = user;
        sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuarioCorrente));
        return true;
    } else {
        return false;
    }
}

function logoutUser() {
    sessionStorage.removeItem('usuarioCorrente');
    usuarioCorrente = {};
    
    if (window.location.pathname.includes('perfil.html')) {
        window.location.href = resolverCaminhoParaHome();
    } else {
        window.location.reload();
    }
}

function addUser(nome, login, senha, email) {
    const userExists = db_usuarios.some(u => u.login === login);
    if (userExists) {
        alert("Este login já está em uso.");
        return;
    }
    const novoUsuario = { nome, login, senha, email };

    fetch(API_URL_USUARIOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario),
    })
    .then(res => res.json())
    .then(data => {
        alert("Cadastro realizado! Faça login.");
        window.location.reload(); 
    });
}

function atualizarInterfaceUsuario() {
    const linkLoginLogout = document.getElementById('link-login-logout');
    const avatarUsuario = document.getElementById('user-avatar');
    const usuarioLogado = usuarioCorrente && usuarioCorrente.login;

    if (avatarUsuario) {
        if (usuarioLogado) {
            avatarUsuario.innerText = usuarioCorrente.nome.charAt(0).toUpperCase();
            avatarUsuario.style.backgroundColor = '#2c3e50';
            avatarUsuario.style.color = '#fff';
            avatarUsuario.title = `Olá, ${usuarioCorrente.nome}`;
            avatarUsuario.onclick = null; 
            avatarUsuario.style.cursor = 'default';
        } else {
            avatarUsuario.innerText = "A";
            avatarUsuario.style.backgroundColor = '#fff';
            avatarUsuario.style.color = '#69B7BF';
        }
    }

    if (linkLoginLogout) {
        if (usuarioLogado) {
            linkLoginLogout.innerText = "Sair";
            linkLoginLogout.href = "#";
            linkLoginLogout.onclick = (e) => { e.preventDefault(); logoutUser(); };
            adicionarLinkPerfilNoMenu();
        } else {
            linkLoginLogout.innerText = "Login";
            linkLoginLogout.href = resolverCaminhoParaLogin();
            linkLoginLogout.onclick = null;
        }
    }
}

function adicionarLinkPerfilNoMenu() {
    const linkLogin = document.getElementById('link-login-logout');
    if (linkLogin) {
        const ulDropdown = linkLogin.closest('ul');
        
        if (!ulDropdown.querySelector('.link-meu-perfil')) {
            const liPerfil = document.createElement('li');
            const linkPerfil = document.createElement('a');
            
            linkPerfil.innerText = "Meu Perfil";
            linkPerfil.className = "link-meu-perfil"; 
            linkPerfil.href = resolverCaminhoParaPerfil();
            
            liPerfil.appendChild(linkPerfil);
            ulDropdown.insertBefore(liPerfil, ulDropdown.firstChild);
        }
    }
}

function resolverCaminhoParaHome() {
    if (window.location.pathname.includes('/modulos/')) return '../../index.html';
    return 'index.html';
}

function resolverCaminhoParaLogin() {
    if (window.location.pathname.includes('/modulos/')) {
        if (window.location.pathname.includes('login.html')) return '#';
        return '../login/login.html';
    }
    return './modulos/login/login.html';
}

function resolverCaminhoParaPerfil() {
    if (window.location.pathname.includes('/modulos/')) {
        return '../perfil/perfil.html';
    }
    return './modulos/perfil/perfil.html';
}

document.addEventListener('DOMContentLoaded', initLoginApp);
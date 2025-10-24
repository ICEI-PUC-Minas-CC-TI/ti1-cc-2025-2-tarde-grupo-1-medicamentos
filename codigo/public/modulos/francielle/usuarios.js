const URL_API = "http://localhost:3000/pessoas";

// GET – Buscar usuários e listar na tabela
function carregarUsuarios() {
    fetch(URL_API)
        .then(res => res.json())
        .then(usuarios => {
            const tabela = document.getElementById("lista-usuarios");
            tabela.innerHTML = ""; // limpar tabela

            usuarios.forEach(u => {
                tabela.innerHTML += `
                    <tr>
                        <td>${u.nome}</td>
                        <td>${u.idade}</td>
                        <td>${u.contato}</td>
                        <td>
                            <a href="editar.html?id=${u.id}">Editar</a>
                            <a href="deletar.html?id=${u.id}">Excluir</a>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => console.error("Erro ao carregar usuários:", err));
}

// POST – Adicionar novo usuário
function adicionarUsuario() {
    const novo = {
        nome: "Novo Usuário",
        idade: 20,
        contato: "0000-0000"
    };

    fetch(URL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novo)
    })
    .then(() => carregarUsuarios())
    .catch(err => console.error("Erro ao adicionar usuário:", err));
}

// DELETE – Remover usuário
function deletarUsuario(id) {
    fetch(`${URL_API}/${id}`, { method: "DELETE" })
        .then(() => carregarUsuarios())
        .catch(err => console.error("Erro ao deletar usuário:", err));
}

// Carregar automaticamente ao abrir página
carregarUsuarios();

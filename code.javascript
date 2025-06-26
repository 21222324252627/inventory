document.addEventListener('DOMContentLoaded', function() {
    const btnCadastrar = document.getElementById('btnCadastrar');
    const btnConsultar = document.getElementById('btnConsultar');
    const btnExportar = document.getElementById('btnExportar');
    const btnLogout = document.getElementById('btnLogout');
    const cadastroSection = document.getElementById('cadastroSection');
    const consultaSection = document.getElementById('consultaSection');
    const formCadastro = document.getElementById('formCadastro');
    const tabelaItens = document.getElementById('tabelaItens');
    const feedback = document.getElementById('feedback');
    const detalhesModal = new bootstrap.Modal(document.getElementById('detalhesModal'));
    
    let inventario = JSON.parse(localStorage.getItem('inventario')) || [];
    let isAuthenticated = false;

    // Event Listeners
    btnCadastrar.addEventListener('click', mostrarCadastro);
    btnConsultar.addEventListener('click', mostrarConsulta);
    btnExportar.addEventListener('click', exportarParaSQL);
    btnLogout.addEventListener('click', logout);
    formCadastro.addEventListener('submit', cadastrarItem);
    
    // Funções
    function mostrarCadastro() {
        if (!isAuthenticated) {
            alert('Você precisa estar logado para acessar esta seção.');
            return;
        }
        cadastroSection.classList.remove('d-none');
        consultaSection.classList.add('d-none');
        formCadastro.reset();
        feedback.innerHTML = '';
    }
    
    function mostrarConsulta() {
        if (!isAuthenticated) {
            alert('Você precisa estar logado para acessar esta seção.');
            return;
        }
        cadastroSection.classList.add('d-none');
        consultaSection.classList.remove('d-none');
        carregarItens();
    }
    
    function carregarItens() {
        tabelaItens.innerHTML = '';
        
        if (inventario.length === 0) {
            tabelaItens.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">Nenhum item cadastrado</td>
                </tr>
            `;
            return;
        }
        
        inventario.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.patrimonio}</td>
                <td>${item.descricao}</td>
                <td><span class="badge ${getBadgeClass(item.estado)}">${item.estado}</span></td>
                <td>${item.tipo}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="mostrarDetalhes('${item.patrimonio}')">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            tabelaItens.appendChild(tr);
        });
    }
    
    function getBadgeClass(estado) {
        switch(estado) {
            case 'Novo': return 'bg-success';
            case 'Usado': return 'bg-info';
            case 'Danificado': return 'bg-danger';
            case 'Em reparo': return 'bg-warning';
            default: return 'bg-secondary';
        }
    }
    
    function cadastrarItem(e) {
        e.preventDefault();
        
        const patrimonio = document.getElementById('patrimonio').value;
        const descricao = document.getElementById('descricao').value;
        const estado = document.getElementById('estado').value;
        const tipo = document.getElementById('tipo').value;
        
        if (inventario.some(item => item.patrimonio === patrimonio)) {
            feedback.innerHTML = '<div class="alert alert-danger">Já existe um item com este número de patrimônio!</div>';
            return;
        }
        
        inventario.push({
            patrimonio,
            descricao,
            estado,
            tipo,
            dataCadastro: new Date().toISOString()
        });
        
        localStorage.setItem('inventario', JSON.stringify(inventario));
        
        formCadastro.reset();
        feedback.innerHTML = '<div class="alert alert-success">Item cadastrado com sucesso!</div>';
        mostrarConsulta();
    }
    
    function exportarParaSQL() {
        if (inventario.length === 0) {
            alert('Nenhum item cadastrado para exportar!');
            return;
        }
        
        let sql = `-- SQL para importação de dados\n`;
        sql += `CREATE TABLE IF NOT EXISTS inventario (\n`;
        sql += `  id INTEGER PRIMARY KEY AUTOINCREMENT,\n`;
        sql += `  patrimonio TEXT NOT NULL,\n`;
        sql += `  descricao TEXT NOT NULL,\n`;
        sql += `  estado TEXT NOT NULL,\n`;
        sql += `  tipo TEXT NOT NULL,\n`;
        sql += `  data_cadastro TEXT NOT NULL\n`;
        sql += `);\n\n`;
        
        inventario.forEach(item => {
            sql += `INSERT INTO inventario (patrimonio, descricao, estado, tipo, data_cadastro) VALUES (\n`;
            sql += `  '${item.patrimonio}',\n`;
            sql += `  '${item.descricao.replace(/'/g, "''")}',\n`;
            sql += `  '${item.estado}',\n`;
            sql += `  '${item.tipo}',\n`;
            sql += `  '${item.dataCadastro}'\n`;
            sql += `);\n`;
        });
        
        const blob = new Blob([sql], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventario.sql';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function logout() {
        isAuthenticated = false;
        alert('Você saiu do sistema.');
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('loginModal').classList.add('show');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
    }
    
    // Função global para o modal
    window.mostrarDetalhes = function(patrimonio) {
        const item = inventario.find(i => i.patrimonio === patrimonio);
        if (item) {
            document.getElementById('modalPatrimonio').textContent = item.patrimonio;
            document.getElementById('modalDescricao').textContent = item.descricao;
            document.getElementById('modalEstado').textContent = item.estado;
            document.getElementById('modalTipo').textContent = item.tipo;
            detalhesModal.show();
        }
    };

    // Login Functionality
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simulação de autenticação
        if (username === 'admin' && password === 'senha123') {
            isAuthenticated = true;
            document.getElementById('mainContent').style.display = 'block';
            document.getElementById('loginModal').classList.remove('show');
            document.body.classList.remove('modal-open');
            document.body.style.overflow = 'auto';
            alert('Login bem-sucedido!');
        } else {
            alert('Usuário ou senha incorretos!');
        }
    });

    // Mostrar o modal de login ao carregar a página
    document.getElementById('loginModal').classList.add('show');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
});

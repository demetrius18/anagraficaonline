document.addEventListener('DOMContentLoaded', () => {
    loadClients();
    restoreDraft();

    document.getElementById('clientForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const cliente = getFormData();
        cliente.dataRegistrazione = new Date().toISOString();

        saveClient(cliente);
        clearDraft();
        document.getElementById('clientForm').reset();
        loadClients();
    });

    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    document.getElementById('searchInput').addEventListener('input', filterClients);
    document.getElementById('globalSearch').addEventListener('input', globalSearchClients);
    document.getElementById('downloadAllBtn').addEventListener('click', downloadAllClientsJSON);

    ['nome', 'cognome', 'telefono', 'piattaforma'].forEach(id => {
        document.getElementById(id).addEventListener('input', saveDraft);
    });
});

function getFormData() {
    return {
        nome: document.getElementById('nome').value,
        cognome: document.getElementById('cognome').value,
        telefono: document.getElementById('telefono').value,
        piattaforma: document.getElementById('piattaforma').value
    };
}

function saveClient(cliente) {
    let clients = JSON.parse(localStorage.getItem('clientRegistry')) || [];
    clients.push(cliente);
    localStorage.setItem('clientRegistry', JSON.stringify(clients));
}

function loadClients() {
    const clients = JSON.parse(localStorage.getItem('clientRegistry')) || [];
    const tableBody = document.getElementById('clientTableBody');
    tableBody.innerHTML = '';

    clients.forEach((cliente, index) => {
        const row = document.createElement('tr');
        const dataSolo = new Date(cliente.dataRegistrazione).toLocaleDateString();
        row.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.cognome}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.piattaforma}</td>
            <td>${dataSolo}</td>
            <td><button onclick="deleteClient(${index})">Elimina</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function deleteClient(index) {
    const clients = JSON.parse(localStorage.getItem('clientRegistry')) || [];
    if (confirm("Sei sicuro di voler eliminare questo cliente?")) {
        clients.splice(index, 1);
        localStorage.setItem('clientRegistry', JSON.stringify(clients));
        loadClients();
    }
}

function filterClients() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#clientTableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

function globalSearchClients() {
    const query = document.getElementById('globalSearch').value.toLowerCase();
    const clients = JSON.parse(localStorage.getItem('clientRegistry')) || [];
    const results = clients.filter(cliente =>
        (cliente.nome + cliente.cognome + cliente.telefono + cliente.piattaforma)
            .toLowerCase().includes(query)
    );

    const tableBody = document.getElementById('clientTableBody');
    tableBody.innerHTML = '';

    results.forEach((cliente, index) => {
        const row = document.createElement('tr');
        const dataSolo = new Date(cliente.dataRegistrazione).toLocaleDateString();
        row.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.cognome}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.piattaforma}</td>
            <td>${dataSolo}</td>
            <td><button onclick="deleteClient(${index})">Elimina</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function exportToCSV() {
    const clients = JSON.parse(localStorage.getItem('clientRegistry')) || [];
    let csv = 'Nome,Cognome,Telefono,Piattaforma,Data Registrazione\n';

    clients.forEach(cliente => {
        const dataSolo = new Date(cliente.dataRegistrazione).toLocaleDateString();
        csv += `${cliente.nome},${cliente.cognome},${cliente.telefono},${cliente.piattaforma},${dataSolo}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clienti.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function downloadAllClientsJSON() {
    const clients = JSON.parse(localStorage.getItem('clientRegistry')) || [];
    const blob = new Blob([JSON.stringify(clients, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clienti.json';
    a.click();
    window.URL.revokeObjectURL(url);
}

function saveDraft() {
    const data = getFormData();
    localStorage.setItem('clientFormDraft', JSON.stringify(data));
}

function restoreDraft() {
    const draft = JSON.parse(localStorage.getItem('clientFormDraft'));
    if (draft) {
        document.getElementById('nome').value = draft.nome || '';
        document.getElementById('cognome').value = draft.cognome || '';
        document.getElementById('telefono').value = draft.telefono || '';
        document.getElementById('piattaforma').value = draft.piattaforma || '';
    }
}

function clearDraft() {
    localStorage.removeItem('clientFormDraft');
}

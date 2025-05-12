document.addEventListener('DOMContentLoaded', () => {
    // Carica i clienti salvati all'avvio
    loadClients();

    // Gestisci l'invio del form
    document.getElementById('clientForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const cognome = document.getElementById('cognome').value;
        const telefono = document.getElementById('telefono').value;
        const piattaforma = document.getElementById('piattaforma').value;
        const dataRegistrazione = new Date().toISOString();

        // Crea oggetto cliente
        const cliente = { nome, cognome, telefono, piattaforma, dataRegistrazione };

        // Salva nel	particolari
        saveClient(cliente);

        // Resetta il form
        document.getElementById('clientForm').reset();

        // Aggiorna la tabella
        loadClients();
    });

    // Gestisci l'esportazione in CSV
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
});

// Salva un cliente in localStorage
function saveClient(cliente) {
    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    clients.push(cliente);
    localStorage.setItem('clients', JSON.stringify(clients));
}

// Carica i clienti e aggiorna la tabella
function loadClients() {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const tableBody = document.getElementById('clientTableBody');
    tableBody.innerHTML = '';

    clients.forEach(cliente => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.cognome}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.piattaforma}</td>
            <td>${new Date(cliente.dataRegistrazione).toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Esporta i dati in CSV
function exportToCSV() {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    let csv = 'Nome,Cognome,Telefono,Piattaforma,Data Registrazione\n';

    clients.forEach(cliente => {
        csv += `${cliente.nome},${cliente.cognome},${cliente.telefono},${cliente.piattaforma},${new Date(cliente.dataRegistrazione).toLocaleString()}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clienti.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

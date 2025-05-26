const express = require('express');
const fs = require('fs');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const { parse } = require('csv-parse/sync');

const app = express();
const PORT = 3000;
const DB_PATH = './db.json';

app.use(express.json());
app.use(express.static('public')); // Serve index.html da /public

const upload = multer({ dest: 'uploads/' });

function caricaClienti() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function salvaClienti(clienti) {
  fs.writeFileSync(DB_PATH, JSON.stringify(clienti, null, 2));
}

// API: Ottieni clienti
app.get('/api/clienti', (req, res) => {
  const clienti = caricaClienti(); // Mostra i più recenti per primi
  res.json(clienti);
});


// API: Aggiungi cliente
app.post('/api/clienti', (req, res) => {
  const clienti = caricaClienti();
  const nuovo = {
    id: req.body.id || Date.now().toString(),
    cognome: req.body.cognome,
    nome: req.body.nome,
    username: req.body.username || '',
    numero: req.body.numero,
    piattaforma: req.body.piattaforma || '',
    data: new Date().toLocaleString(),
    timestamp: Date.now() // ⬅️ Nuovo campo per calcolo del tempo
  };
  clienti.unshift(nuovo);
  salvaClienti(clienti);
  res.json({ success: true, cliente: nuovo });
});

// API: Elimina cliente
app.delete('/api/clienti/:id', (req, res) => {
  let clienti = caricaClienti();
  const id = req.params.id;
  clienti = clienti.filter(c => c.id !== id);
  salvaClienti(clienti);
  res.json({ success: true });
});

// API: Modifica cliente
app.patch('/api/clienti/:id', (req, res) => {
  const clienti = caricaClienti();
  const cliente = clienti.find(c => c.id === req.params.id);
  if (!cliente) return res.json({ success: false, message: 'Cliente non trovato' });

  Object.assign(cliente, req.body);
  salvaClienti(clienti);
  res.json({ success: true });
});

// API: Esporta CSV
app.get('/api/export', (req, res) => {
  const clienti = caricaClienti();
  const csv = [
    ['ID', 'Cognome', 'Nome', 'Username', 'Numero', 'Piattaforma', 'Data'],
    ...clienti.map(c => [c.id, c.cognome, c.nome, c.username, c.numero, c.piattaforma, c.data])
  ].map(r => r.join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="clienti.csv"');
  res.send(csv);
});

// API: Esporta XLSX
app.get('/api/export-xlsx', (req, res) => {
  const clienti = caricaClienti();
  const ws = xlsx.utils.json_to_sheet(clienti);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Clienti');

  const filePath = path.join(__dirname, 'clienti.xlsx');
  xlsx.writeFile(wb, filePath);

  res.download(filePath, 'clienti.xlsx', err => {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
});

// Importazione logica unificata
function importaDatiDaOggetto(obj) {
  const clienti = caricaClienti();
  let count = 0;

  for (let c of obj) {
    if (!c.cognome || !c.nome || !c.numero) continue;

    clienti.push({
      id: c.id?.toString().trim() || '',
      cognome: c.cognome,
      nome: c.nome,
      username: c.username || '',
      numero: c.numero,
      piattaforma: c.piattaforma || '',
      data: new Date().toLocaleString()
    });

    count++;
  }

  salvaClienti(clienti);
  return count;
}

// API: Importa CSV
app.post('/api/import', upload.single('file'), (req, res) => {
  try {
    const content = fs.readFileSync(req.file.path, 'utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true
    });
    const count = importaDatiDaOggetto(records);
    fs.unlinkSync(req.file.path);
    res.json({ success: true, count });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// API: Importa XLSX
app.post('/api/import-xlsx', upload.single('file'), (req, res) => {
  try {
    const workbook = xlsx.readFileSync(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    const count = importaDatiDaOggetto(data);
    fs.unlinkSync(req.file.path);
    res.json({ success: true, count });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server attivo su http://localhost:${PORT}`);
});

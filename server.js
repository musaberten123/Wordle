// Basit Node.js API sunucusu
// Kullanıcıları ve puanları proje klasöründeki accounts-data.json dosyasında saklar.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'accounts-data.json');

function loadAccounts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2), 'utf-8');
      return {};
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to load accounts-data.json', e);
    return {};
  }
}

function saveAccounts(accounts) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save accounts-data.json', e);
  }
}

function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function handleOptions(req, res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end();
}

function readBody(req, cb) {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
    if (data.length > 1e6) {
      // 1MB sınır
      req.connection.destroy();
    }
  });
  req.on('end', () => {
    if (!data) return cb(null, {});
    try {
      const json = JSON.parse(data);
      cb(null, json);
    } catch (e) {
      cb(e);
    }
  });
}

function validatePasswordServer(pw) {
  if (!pw || pw.length < 8) {
    return 'Şifre en az 8 karakter olmalı.';
  }
  if (!/[A-ZÇĞİÖŞÜ]/.test(pw)) {
    return 'Şifre en az 1 büyük harf içermeli.';
  }
  const digitCount = (pw.match(/\d/g) || []).length;
  if (digitCount < 3) {
    return 'Şifre en az 3 adet sayı içermeli.';
  }
  if (!/[^\w\s]/.test(pw)) {
    return 'Şifre en az 1 özel karakter (. , ! ? vb.) içermeli.';
  }
  return null;
}

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  if (url === '/api/accounts' && method === 'GET') {
    const accounts = loadAccounts();
    return sendJSON(res, 200, { ok: true, accounts });
  }

  if (url === '/api/register' && method === 'POST') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { ok: false, message: 'Geçersiz JSON.' });
      let { username, password } = body || {};
      username = (username || '').trim();
      if (!username) {
        return sendJSON(res, 400, { ok: false, message: 'Kullanıcı adı boş olamaz.' });
      }
      const pwErr = validatePasswordServer(password);
      if (pwErr) {
        return sendJSON(res, 400, { ok: false, message: pwErr });
      }
      const accounts = loadAccounts();
      if (accounts[username]) {
        return sendJSON(res, 400, { ok: false, message: 'Bu kullanıcı adı zaten kullanılıyor.' });
      }
      accounts[username] = {
        username,
        password,
        score: 0,
        dailyPlayed: {}
      };
      saveAccounts(accounts);
      return sendJSON(res, 200, { ok: true, message: 'Hesap oluşturuldu.', account: accounts[username] });
    });
  }

  if (url === '/api/login' && method === 'POST') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { ok: false, message: 'Geçersiz JSON.' });
      let { username, password } = body || {};
      username = (username || '').trim();
      const accounts = loadAccounts();
      const acc = accounts[username];
      if (!acc) {
        return sendJSON(res, 400, { ok: false, message: 'Kullanıcı bulunamadı.' });
      }
      if (acc.password !== password) {
        return sendJSON(res, 400, { ok: false, message: 'Şifre hatalı.' });
      }
      return sendJSON(res, 200, { ok: true, message: 'Giriş başarılı.', account: acc });
    });
  }

  if (url === '/api/addScore' && method === 'POST') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { ok: false, message: 'Geçersiz JSON.' });
      let { username, score } = body || {};
      username = (username || '').trim();
      const s = Number(score) || 0;
      const accounts = loadAccounts();
      const acc = accounts[username];
      if (!acc) {
        return sendJSON(res, 400, { ok: false, message: 'Kullanıcı bulunamadı.' });
      }
      acc.score += s;
      saveAccounts(accounts);
      return sendJSON(res, 200, { ok: true, score: acc.score });
    });
  }

  if (url === '/api/markDaily' && method === 'POST') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { ok: false, message: 'Geçersiz JSON.' });
      let { username, date } = body || {};
      username = (username || '').trim();
      const today = date || new Date().toISOString().slice(0, 10);
      const accounts = loadAccounts();
      const acc = accounts[username];
      if (!acc) {
        return sendJSON(res, 400, { ok: false, message: 'Kullanıcı bulunamadı.' });
      }
      if (!acc.dailyPlayed) acc.dailyPlayed = {};
      acc.dailyPlayed[today] = true;
      saveAccounts(accounts);
      return sendJSON(res, 200, { ok: true });
    });
  }

  if (url.startsWith('/api/leaderboard') && method === 'GET') {
    const accounts = loadAccounts();
    console.log('Leaderboard request - Total accounts:', Object.keys(accounts).length);
    // Tüm kullanıcıları array'e çevir ve puanlarına göre sırala (yüksekten düşüğe)
    const users = Object.values(accounts)
      .filter(acc => acc && acc.username) // Geçerli kullanıcıları filtrele
      .map(acc => ({
        username: acc.username,
        score: Number(acc.score) || 0 // Sayıya çevir
      }))
      .sort((a, b) => b.score - a.score); // Yüksekten düşüğe sırala
    
    // Query parametresi kontrolü: ?limit=10 gibi
    const urlParts = url.split('?');
    let limit = users.length; // Varsayılan: tümü
    if (urlParts.length > 1) {
      const params = new URLSearchParams(urlParts[1]);
      const limitParam = params.get('limit');
      if (limitParam) {
        limit = parseInt(limitParam) || users.length;
      }
    }
    
    const limitedUsers = limit > 0 ? users.slice(0, limit) : users;
    console.log('Leaderboard response - Users:', limitedUsers.length, 'Total:', users.length);
    return sendJSON(res, 200, { ok: true, leaderboard: limitedUsers, total: users.length });
  }

  // Bulunamadı
  sendJSON(res, 404, { ok: false, message: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Account API server listening on http://localhost:${PORT}`);
});





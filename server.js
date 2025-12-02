// server.js – backend + hesap/puan API’si + basit admin API

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// Render için PORT
const PORT = process.env.PORT || 3000;

// *** Admin anahtarı (sadece sen biliyorsun) ***
const ADMIN_KEY = process.env.ADMIN_KEY || "kakyE212019!"; // İstersen değiştir

// JSON parse
app.use(express.json());

// Statik dosyalar (index.html, script.js, style.css, vs.)
app.use(express.static(path.join(__dirname)));

// Hesap dosyası
const DATA_FILE = path.join(__dirname, "accounts-data.json");

// ---- Yardımcı fonksiyonlar ----
function loadAccounts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = { accounts: {} };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial.accounts;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed.accounts || {};
  } catch (err) {
    console.error("accounts-data.json okunamadı:", err);
    return {};
  }
}

function saveAccounts(accounts) {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ accounts }, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error("accounts-data.json yazılamadı:", err);
  }
}

function sanitizeAccount(acc) {
  return {
    username: acc.username,
    score: acc.score || 0,
    dailyPlayed: acc.dailyPlayed || {}
  };
}

// ---- Normal API endpoint’leri ----

// Tüm hesaplar
app.get("/api/accounts", (req, res) => {
  const accounts = loadAccounts();
  return res.json({ ok: true, accounts });
});

// Kayıt
app.post("/api/register", (req, res) => {
  const { username, password } = req.body || {};
  const user = (username || "").trim();
  const pw = password || "";

  if (!user) {
    return res.status(400).json({ ok: false, message: "Kullanıcı adı boş olamaz." });
  }
  if (!pw) {
    return res.status(400).json({ ok: false, message: "Şifre boş olamaz." });
  }

  const accounts = loadAccounts();

  if (accounts[user]) {
    return res.status(400).json({ ok: false, message: "Bu kullanıcı adı zaten kayıtlı." });
  }

  accounts[user] = {
    username: user,
    password: pw, // demo için düz metin
    score: 0,
    dailyPlayed: {}
  };

  saveAccounts(accounts);

  return res.json({
    ok: true,
    account: sanitizeAccount(accounts[user])
  });
});

// Giriş
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  const user = (username || "").trim();
  const pw = password || "";

  const accounts = loadAccounts();
  const acc = accounts[user];

  if (!acc) {
    return res.status(400).json({ ok: false, message: "Böyle bir kullanıcı yok." });
  }
  if (acc.password !== pw) {
    return res.status(400).json({ ok: false, message: "Şifre hatalı." });
  }

  return res.json({
    ok: true,
    account: sanitizeAccount(acc)
  });
});

// Puan ekle
app.post("/api/addScore", (req, res) => {
  const { username, score } = req.body || {};
  const user = (username || "").trim();
  const s = Number(score) || 0;

  if (!user) {
    return res.status(400).json({ ok: false, message: "Kullanıcı adı gerekli." });
  }

  const accounts = loadAccounts();
  const acc = accounts[user];
  if (!acc) {
    return res.status(400).json({ ok: false, message: "Kullanıcı bulunamadı." });
  }

  acc.score = (acc.score || 0) + s;
  saveAccounts(accounts);

  return res.json({ ok: true, account: sanitizeAccount(acc) });
});

// Günlük oyun işaretle
app.post("/api/markDaily", (req, res) => {
  const { username, date } = req.body || {};
  const user = (username || "").trim();
  const d = date || new Date().toISOString().slice(0, 10);

  const accounts = loadAccounts();
  const acc = accounts[user];
  if (!acc) {
    return res.status(400).json({ ok: false, message: "Kullanıcı bulunamadı." });
  }

  acc.dailyPlayed = acc.dailyPlayed || {};
  acc.dailyPlayed[d] = true;
  saveAccounts(accounts);

  return res.json({ ok: true, account: sanitizeAccount(acc) });
});

// Liderlik tablosu
app.get("/api/leaderboard", (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const accounts = loadAccounts();

  const list = Object.values(accounts)
    .map(sanitizeAccount)
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const limited = limit ? list.slice(0, limit) : list;

  return res.json({ ok: true, leaderboard: limited });
});

// Sağlık kontrolü
app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "up" });
});

// ---- ADMIN API (sadece sen kullanacaksın) ----

// JSON’ı oku
app.get("/api/admin/accounts", (req, res) => {
  const key = req.query.key;
  if (key !== ADMIN_KEY) {
    return res.status(403).json({ ok: false, message: "Yetkisiz" });
  }
  const accounts = loadAccounts();
  return res.json({ ok: true, accounts });
});

// JSON’ı kaydet
app.post("/api/admin/accounts", (req, res) => {
  const key = req.query.key;
  if (key !== ADMIN_KEY) {
    return res.status(403).json({ ok: false, message: "Yetkisiz" });
  }

  const { accounts } = req.body || {};
  if (!accounts || typeof accounts !== "object") {
    return res.status(400).json({ ok: false, message: "Geçersiz accounts yapısı." });
  }

  saveAccounts(accounts);
  return res.json({ ok: true });
});

// Sunucu
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

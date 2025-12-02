const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json()); // JSON body

// STATIC FILES (index.html, script.js, style.css vs.)
app.use(express.static(__dirname));

// PORT (Render için şart)
const PORT = process.env.PORT || 3000;

// accounts-data.json
const DATA_FILE = path.join(__dirname, "accounts-data.json");

function loadAccounts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2), "utf-8");
      return {};
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load accounts-data.json", e);
    return {};
  }
}

function saveAccounts(accounts) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(accounts, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save accounts-data.json", e);
  }
}

function validatePasswordServer(pw) {
  if (!pw || pw.length < 8) return "Şifre en az 8 karakter olmalı.";
  if (!/[A-ZÇĞİÖŞÜ]/.test(pw)) return "Şifre en az 1 büyük harf içermeli.";
  const digitCount = (pw.match(/\d/g) || []).length;
  if (digitCount < 3) return "Şifre en az 3 sayı içermeli.";
  if (!/[^\w\s]/.test(pw)) return "Şifre en az 1 özel karakter (. , ! ? vb.) içermeli.";
  return null;
}

// -------- API ----------

app.get("/api/accounts", (req, res) => {
  const accounts = loadAccounts();
  res.json({ ok: true, accounts });
});

app.post("/api/register", (req, res) => {
  let { username, password } = req.body || {};
  username = (username || "").trim();
  if (!username) return res.status(400).json({ ok: false, message: "Kullanıcı adı boş olamaz." });

  const pwErr = validatePasswordServer(password);
  if (pwErr) return res.status(400).json({ ok: false, message: pwErr });

  const accounts = loadAccounts();
  if (accounts[username]) return res.status(400).json({ ok: false, message: "Bu kullanıcı adı zaten kullanılıyor." });

  accounts[username] = { username, password, score: 0, dailyPlayed: {} };
  saveAccounts(accounts);
  res.json({ ok: true, message: "Hesap oluşturuldu.", account: accounts[username] });
});

app.post("/api/login", (req, res) => {
  let { username, password } = req.body || {};
  username = (username || "").trim();
  const accounts = loadAccounts();
  const acc = accounts[username];
  if (!acc) return res.status(400).json({ ok: false, message: "Kullanıcı bulunamadı." });
  if (acc.password !== password) return res.status(400).json({ ok: false, message: "Şifre hatalı." });
  res.json({ ok: true, message: "Giriş başarılı.", account: acc });
});

app.post("/api/addScore", (req, res) => {
  let { username, score } = req.body || {};
  username = (username || "").trim();
  const s = Number(score) || 0;
  const accounts = loadAccounts();
  const acc = accounts[username];
  if (!acc) return res.status(400).json({ ok: false, message: "Kullanıcı bulunamadı." });
  acc.score += s;
  saveAccounts(accounts);
  res.json({ ok: true, score: acc.score });
});

app.post("/api/markDaily", (req, res) => {
  let { username, date } = req.body || {};
  username = (username || "").trim();
  const today = date || new Date().toISOString().slice(0, 10);
  const accounts = loadAccounts();
  const acc = accounts[username];
  if (!acc) return res.status(400).json({ ok: false, message: "Kullanıcı bulunamadı." });
  if (!acc.dailyPlayed) acc.dailyPlayed = {};
  acc.dailyPlayed[today] = true;
  saveAccounts(accounts);
  res.json({ ok: true });
});

app.get("/api/leaderboard", (req, res) => {
  const accounts = loadAccounts();
  const users = Object.values(accounts)
    .map(acc => ({ username: acc.username, score: Number(acc.score) || 0 }))
    .sort((a, b) => b.score - a.score);

  const limit = Number(req.query.limit) || users.length;
  res.json({ ok: true, leaderboard: users.slice(0, limit), total: users.length });
});

// ---------- FRONTEND ROOT ----------

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ---------- SERVER LISTEN ----------

app.listen(PORT, () => {
  console.log("Server çalışıyor → PORT:", PORT);
});

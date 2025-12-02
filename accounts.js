// Basit hesap yönetimi (arka plandaki Node.js sunucusu ve accounts-data.json ile)
// NOT: Bu dosya artık kullanıcıları localStorage'da değil, server.js üzerinden diskte saklar.

const API_BASE = '/api';
const CURRENT_USER_KEY = 'wordle_current_user_v1';

let accountsStore = {};
let currentUser = loadCurrentUser();
let accountsLoaded = false;

function loadCurrentUser() {
  try {
    const u = localStorage.getItem(CURRENT_USER_KEY);
    return u || null;
  } catch (e) {
    console.warn('Failed to load current user', e);
  }
  return null;
}

function saveCurrentUser(username) {
  try {
    if (username) {
      localStorage.setItem(CURRENT_USER_KEY, username);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.warn('Failed to save current user', e);
  }
}

// Şifre kuralı kontrolü
function validatePassword(pw) {
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

// Sunucudan veriyi çek
async function syncAccountsFromServer() {
  try {
    const res = await fetch(`${API_BASE}/accounts`);
    if (!res.ok) throw new Error('Accounts fetch failed');
    const data = await res.json();
    accountsStore = data.accounts || {};
    accountsLoaded = true;
  } catch (e) {
    console.warn('Sunucudan hesaplar çekilemedi:', e);
  }
}

// Hesap oluşturma
async function registerAccount(username, password) {
  username = (username || '').trim();
  if (!username) {
    return { ok: false, message: 'Kullanıcı adı boş olamaz.' };
  }
  const pwErr = validatePassword(password);
  if (pwErr) {
    return { ok: false, message: pwErr };
  }
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.ok && data.account) {
      accountsStore[username] = data.account;
    }
    return data;
  } catch (e) {
    console.warn('Register failed', e);
    return { ok: false, message: 'Sunucuya bağlanılamadı.' };
  }
}

// Giriş
async function loginAccount(username, password) {
  username = (username || '').trim();
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.ok && data.account) {
      accountsStore[username] = data.account;
      currentUser = username;
      saveCurrentUser(username);
      renderAccountPanel();
      renderScoreBoard();
    }
    return data;
  } catch (e) {
    console.warn('Login failed', e);
    return { ok: false, message: 'Sunucuya bağlanılamadı.' };
  }
}

function logoutAccount() {
  currentUser = null;
  saveCurrentUser(null);
  renderAccountPanel();
  renderScoreBoard();
}

// Oyun puan ekleme API'si
function addScoreToCurrentUser(score) {
  if (!currentUser) return;
  const acc = accountsStore[currentUser];
  if (!acc) return;
  const s = Number(score) || 0;
  acc.score += s;
  // Sunucuya yansıt
  fetch(`${API_BASE}/addScore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser, score: s })
  }).catch(e => console.warn('addScore API hatası', e));
  renderAccountPanel();
  renderScoreBoard();
}

function canCurrentUserPlayDaily() {
  if (!currentUser) return true; // misafirler için kısıtlama yok
  const acc = accountsStore[currentUser];
  if (!acc) return true;
  const today = new Date().toISOString().slice(0, 10);
  return !acc.dailyPlayed || !acc.dailyPlayed[today];
}

function markCurrentUserDailyPlayed() {
  if (!currentUser) return;
  const acc = accountsStore[currentUser];
  if (!acc) return;
  const today = new Date().toISOString().slice(0, 10);
  if (!acc.dailyPlayed) acc.dailyPlayed = {};
  acc.dailyPlayed[today] = true;
  fetch(`${API_BASE}/markDaily`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser, date: today })
  }).catch(e => console.warn('markDaily API hatası', e));
}

function getCurrentUser() {
  return currentUser;
}

function getCurrentUserTotalScore() {
  if (!currentUser) return 0;
  const acc = accountsStore[currentUser];
  return acc ? acc.score : 0;
}

// Liderlik tablosunu sunucudan çek (limit parametresi ile)
async function fetchLeaderboard(limit = null) {
  try {
    const url = limit ? `${API_BASE}/leaderboard?limit=${limit}` : `${API_BASE}/leaderboard`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Leaderboard fetch failed:', res.status, res.statusText);
      throw new Error(`Sunucu hatası: ${res.status}`);
    }
    const data = await res.json();
    if (!data.ok) {
      console.error('Leaderboard API error:', data);
      return [];
    }
    return data.leaderboard || [];
  } catch (e) {
    console.error('Liderlik tablosu çekilemedi:', e);
    return null; // null döndür ki hata mesajı gösterilebilsin
  }
}


// Liderlik tablosunu göster (modal'da - TÜM kullanıcılar)
async function showLeaderboard() {
  const modal = document.getElementById('leaderboard-modal');
  const listEl = document.getElementById('leaderboard-list');
  if (!modal || !listEl) return;

  listEl.innerHTML = '<div style="text-align: center; padding: 20px;">Yükleniyor...</div>';
  modal.classList.add('show');

  const leaderboard = await fetchLeaderboard(); // Limit yok, tüm kullanıcılar
  
  // Hata durumu
  if (leaderboard === null) {
    listEl.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff4444;">⚠️ Sunucuya bağlanılamadı. Lütfen sunucunun çalıştığından emin olun.<br><small style="color: #999;">PowerShell\'de: node server.js</small></div>';
    return;
  }
  
  // Boş liste durumu
  if (leaderboard.length === 0) {
    listEl.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">Henüz puan kaydedilmemiş.</div>';
    return;
  }

  listEl.innerHTML = '';
  leaderboard.forEach((user, index) => {
    const item = document.createElement('div');
    item.className = 'leaderboard-item';
    
    const rank = document.createElement('span');
    rank.className = 'leaderboard-rank';
    rank.textContent = `#${index + 1}`;
    
    const name = document.createElement('span');
    name.className = 'leaderboard-name';
    name.textContent = user.username;
    
    const score = document.createElement('span');
    score.className = 'leaderboard-score';
    score.textContent = `${user.score} puan`;
    
    // Eğer bu kullanıcı şu anki kullanıcıysa vurgula
    if (currentUser === user.username) {
      item.classList.add('current-user');
    }
    
    item.appendChild(rank);
    item.appendChild(name);
    item.appendChild(score);
    listEl.appendChild(item);
  });
}

// Sağ üst köşedeki skor board'unu güncelle (içinde top 10 liderlik tablosu)
let isRenderingScoreBoard = false; // Çift render önleme
async function renderScoreBoard() {
  const el = document.getElementById('score-board');
  if (!el) return;
  
  // Eğer zaten render ediliyorsa bekle
  if (isRenderingScoreBoard) return;
  isRenderingScoreBoard = true;

  el.innerHTML = ''; // Önce temizle

  // Başlık ve "Tümünü Gör" butonu
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #333;';
  
  const title = document.createElement('span');
  title.textContent = '🏆 Top 10';
  title.style.cssText = 'font-weight: bold; font-size: 0.9rem; color: #ffd700;';
  header.appendChild(title);

  const showAllBtn = document.createElement('button');
  showAllBtn.textContent = 'Tümü';
  showAllBtn.title = 'Tüm Kullanıcıları Gör';
  showAllBtn.style.cssText = 'background: #6aaa64; color: #fff; border: none; border-radius: 4px; padding: 2px 6px; cursor: pointer; font-size: 0.7rem;';
  showAllBtn.onclick = showLeaderboard;
  header.appendChild(showAllBtn);

  el.appendChild(header);

  // Liderlik tablosu listesi
  const listContainer = document.createElement('div');
  listContainer.id = 'score-board-leaderboard-list';
  listContainer.style.cssText = 'max-height: 300px; overflow-y: auto;';
  
  // Top 10'u çek ve göster
  const leaderboard = await fetchLeaderboard(10);
  
  if (leaderboard === null) {
    listContainer.innerHTML = '<div style="text-align: center; padding: 10px; color: #999; font-size: 0.75rem;">Sunucuya bağlanılamadı</div>';
  } else if (leaderboard.length === 0) {
    listContainer.innerHTML = '<div style="text-align: center; padding: 10px; color: #999; font-size: 0.75rem;">Henüz puan yok</div>';
  } else {
    leaderboard.forEach((user, index) => {
      const item = document.createElement('div');
      item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 0.75rem; border-bottom: 1px solid #2a2a2b;';
      
      if (currentUser === user.username) {
        item.style.background = '#3a4a3a';
        item.style.padding = '4px 6px';
        item.style.borderRadius = '4px';
        item.style.fontWeight = 'bold';
      }
      
      const rank = document.createElement('span');
      rank.textContent = `${index + 1}.`;
      rank.style.cssText = 'color: #ffd700; min-width: 25px; font-weight: bold;';
      
      const name = document.createElement('span');
      name.textContent = user.username;
      name.style.cssText = 'flex: 1; color: #fff; margin-left: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
      
      const score = document.createElement('span');
      score.textContent = user.score;
      score.style.cssText = 'color: #6aaa64; font-weight: 600; margin-left: 8px;';
      
      item.appendChild(rank);
      item.appendChild(name);
      item.appendChild(score);
      listContainer.appendChild(item);
    });
  }
  
  el.appendChild(listContainer);
  isRenderingScoreBoard = false; // Render tamamlandı
}

// UI
function renderAccountPanel() {
  const holder = document.getElementById('account-panel');
  if (!holder) return;

  holder.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = 'Hesap';
  holder.appendChild(title);

  const info = document.createElement('div');

  if (currentUser && accountsStore[currentUser]) {
    const acc = accountsStore[currentUser];
    const userEl = document.createElement('div');
    userEl.textContent = `Kullanıcı: ${acc.username}`;

    const scoreEl = document.createElement('div');
    scoreEl.textContent = `Toplam Puan: ${acc.score}`;

    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.textContent = 'Çıkış';
    logoutBtn.onclick = logoutAccount;

    info.appendChild(userEl);
    info.appendChild(scoreEl);
    info.appendChild(logoutBtn);
  } else {
    const note = document.createElement('div');
    note.textContent = 'Misafir olarak oynuyorsunuz. Puanınız kaydedilmeyecek.';
    info.appendChild(note);

    const btnRegister = document.createElement('button');
    btnRegister.type = 'button';
    btnRegister.textContent = 'Üye Ol';
    btnRegister.onclick = () => {
      window.location.href = 'register.html';
    };

    const btnLogin = document.createElement('button');
    btnLogin.type = 'button';
    btnLogin.textContent = 'Giriş Yap';
    btnLogin.onclick = () => {
      window.location.href = 'login.html';
    };

    info.appendChild(btnRegister);
    info.appendChild(btnLogin);
  }

  holder.appendChild(info);
  // Hesap paneli her güncellendiğinde skor board'u da güncelle
  renderScoreBoard();
}

// Panel yükleniyor göstergesini hazırla
function renderAccountPanelLoading() {
  const holder = document.getElementById('account-panel');
  if (!holder) return;
  holder.innerHTML = '<div>Hesap paneli yükleniyor...</div>';
}

// Sunucuya ulaşılamasa da butonları gösteren yedek panel
function renderAccountPanelAlwaysShowBtns() {
  const holder = document.getElementById('account-panel');
  if (!holder) return;
  holder.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = 'Hesap';
  holder.appendChild(title);

  const info = document.createElement('div');
  const note = document.createElement('div');
  note.textContent = 'Misafir olarak oynuyorsunuz. Puanınız kaydedilmeyecek.';
  info.appendChild(note);

  const btnRegister = document.createElement('button');
  btnRegister.type = 'button';
  btnRegister.textContent = 'Üye Ol';
  btnRegister.onclick = () => {
    window.location.href = 'register.html';
  };

  const btnLogin = document.createElement('button');
  btnLogin.type = 'button';
  btnLogin.textContent = 'Giriş Yap';
  btnLogin.onclick = () => {
    window.location.href = 'login.html';
  };

  info.appendChild(btnRegister);
  info.appendChild(btnLogin);

  holder.appendChild(info);
  // Sunucuya ulaşılamadığında da skor board'u misafir olarak göster
  renderScoreBoard();
}

// Paneli async yükle, garanti her zaman buton göster
// Diğer eski panel yükleyici kodlar silindi!
document.addEventListener('DOMContentLoaded', () => {
  renderAccountPanelLoading();
  
  // Liderlik tablosu modal kapatma butonu
  const leaderboardCloseBtn = document.getElementById('leaderboard-close-btn');
  const leaderboardModal = document.getElementById('leaderboard-modal');
  if (leaderboardCloseBtn) {
    leaderboardCloseBtn.onclick = () => {
      if (leaderboardModal) leaderboardModal.classList.remove('show');
    };
  }
  if (leaderboardModal) {
    leaderboardModal.onclick = (e) => {
      if (e.target === leaderboardModal) {
        leaderboardModal.classList.remove('show');
      }
    };
  }

  let loader = (typeof syncAccountsFromServer === 'function')
    ? syncAccountsFromServer()
    : Promise.resolve();
  Promise.resolve(loader)
    .then(() => {
      try {
        if (typeof renderAccountPanel === "function") {
          renderAccountPanel();
        } else {
          renderAccountPanelAlwaysShowBtns();
        }
        renderScoreBoard(); // Hesaplar yüklendikten sonra skor board'u göster (tek sefer)
      } catch {
        renderAccountPanelAlwaysShowBtns();
        renderScoreBoard(); // Hata durumunda da göster
      }
    })
    .catch(() => {
      renderAccountPanelAlwaysShowBtns();
      renderScoreBoard(); // Hata durumunda da göster
    });
});

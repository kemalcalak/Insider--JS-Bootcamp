// bu kısımdaki değişiklik ile proje çalıştırılabilir
var appendLocation = ".ins-api-users";

(function () {
  const style = document.createElement("style");
  style.textContent = `
    .user-card {
      border:1px solid #ccc;
      border-radius:5px;
      padding:10px;
      margin-bottom:10px;
      display:flex;
      justify-content:space-between;
      align-items:center;
    }
    .user-info { flex:1; }
    .user-info h3 { margin:0 0 5px; }
    .user-info p { margin:2px 0; }
    .delete-btn, .reload-btn {
      background:#e74c3c;
      color:#fff;
      border:none;
      padding:5px 10px;
      border-radius:4px;
      cursor:pointer;
    }
    .reload-btn {
      background:#3498db;
    }
    .delete-btn:hover { background:#c0392b; }
    .reload-btn:hover { background:#2980b9; }
  `;
  document.head.appendChild(style);

  const container = document.querySelector(appendLocation);
  if (!container) {
    console.error(`Selector bulunamadı: ${appendLocation}`);
    return;
  }

  const STORAGE_KEY = "usersWithExpiry";
  const ONE_DAY = 1000 * 60 * 60 * 24;
  const RELOAD_SESSION_KEY = "reloadClicked";
  let reloadBtn;

  function loadUsers() {
    return new Promise((resolve, reject) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      const forceReload = sessionStorage.getItem(RELOAD_SESSION_KEY) === "true";

      if (!forceReload && stored) {
        try {
          const { timestamp, data } = JSON.parse(stored);
          if (Date.now() - timestamp < ONE_DAY) {
            return resolve(data);
          }
        } catch (e) {
          console.warn("Cache okunamadı, yeni fetch:", e);
        }
      }

      if (forceReload) sessionStorage.removeItem(RELOAD_SESSION_KEY);

      fetch("https://jsonplaceholder.typicode.com/users")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((users) => {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ timestamp: Date.now(), data: users })
          );
          resolve(users);
        })
        .catch((err) => reject(err));
    });
  }

  function renderUsers(users) {
    container.innerHTML = "";
    users.forEach((user) => {
      const card = document.createElement("div");
      card.className = "user-card";
      card.innerHTML = `
        <div class="user-info">
          <h3>${user.name}</h3>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Adres:</strong> ${user.address.street}, ${user.address.city}</p>
        </div>
        <button class="delete-btn">Sil</button>
      `;
      card
        .querySelector(".delete-btn")
        .addEventListener("click", () => deleteUser(user.id));
      container.appendChild(card);
    });
  }

  function deleteUser(id) {
    let users = [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        users = JSON.parse(stored).data;
      } catch {}
    }
    users = users.filter((u) => u.id !== id);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ timestamp: Date.now(), data: users })
    );
    renderUsers(users);
  }

  function showReloadButton() {
    if (
      sessionStorage.getItem(RELOAD_SESSION_KEY) ||
      container.querySelector(".reload-btn")
    )
      return;

    reloadBtn = document.createElement("button");
    reloadBtn.className = "reload-btn";
    reloadBtn.textContent = "Kullanıcıları Yeniden Yükle";
    reloadBtn.addEventListener("click", () => {
      sessionStorage.setItem(RELOAD_SESSION_KEY, "true");
      localStorage.removeItem(STORAGE_KEY);
      reloadBtn.remove();
      init();
    });
    container.appendChild(reloadBtn);
  }

  const observer = new MutationObserver(() => {
    const hasCards = container.querySelectorAll(".user-card").length > 0;
    if (!hasCards) showReloadButton();
    else if (reloadBtn) reloadBtn.remove();
  });
  observer.observe(container, { childList: true });

  function init() {
    loadUsers()
      .then((users) => renderUsers(users))
      .catch((err) => {
        container.innerHTML = `<p style="color:red;">Veri yüklenirken hata: ${err.message}</p>`;
      });
  }

  init();
})();

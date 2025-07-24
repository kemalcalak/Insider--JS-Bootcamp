const style = document.createElement("style");
style.textContent = `
  .ins-api-users { max-width: 800px; margin: 2rem auto; font-family: Arial, sans-serif; }
  .user-card { 
    border: 1px solid #ccc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .user-info { flex: 1; }
  .user-info h3 { margin: 0 0 .5rem; }
  .user-info p { margin: .25rem 0; color: #555; }
  .delete-btn {
    background: #e74c3c; color: #fff; border: none; padding: .5rem 1rem;
    border-radius: 4px; cursor: pointer;
  }
  .delete-btn:hover { background: #c0392b; }
`;
document.head.appendChild(style);

const container = document.querySelector(".ins-api-users");

const STORAGE_KEY = "users";
const STORAGE_TS_KEY = "usersTimestamp";
const ONE_DAY = 1000 * 60 * 60 * 24;

function loadUsers() {
  return new Promise((resolve, reject) => {
    const cached = localStorage.getItem(STORAGE_KEY);
    const ts = localStorage.getItem(STORAGE_TS_KEY);

    if (
      cached &&
      ts &&
      Date.now() - parseInt(ts, 10) < ONE_DAY &&
      Array.isArray(JSON.parse(cached)) &&
      JSON.parse(cached).length > 0
    ) {
      resolve(JSON.parse(cached));
    } else {
      fetch("https://jsonplaceholder.typicode.com/users")
        .then((res) => {
          if (!res.ok)
            throw new Error("Sunucudan veri alınamadı: " + res.status);
          return res.json();
        })
        .then((users) => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
          localStorage.setItem(STORAGE_TS_KEY, Date.now().toString());
          resolve(users);
        })
        .catch((err) => reject(err));
    }
  });
}

function renderUsers(users) {
  container.innerHTML = "";
  users.forEach((user) => {
    const card = document.createElement("div");
    card.className = "user-card";

    const info = document.createElement("div");
    info.className = "user-info";
    info.innerHTML = `
      <h3>${user.name}</h3>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Adres:</strong> ${user.address.street}, ${user.address.city}</p>
    `;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Sil";
    delBtn.addEventListener("click", () => deleteUser(user.id, card));

    card.appendChild(info);
    card.appendChild(delBtn);
    container.appendChild(card);
  });
}

function deleteUser(userId, cardElement) {
  let users = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  users = users.filter((u) => u.id !== userId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  renderUsers(users);
}

function showError(message) {
  container.innerHTML = `<p style="color:red; text-align:center;">${message}</p>`;
}

loadUsers()
  .then((users) => renderUsers(users))
  .catch((err) => {
    console.error(err);
    showError("Kullanıcı verisi yüklenirken bir hata oluştu.");
  });

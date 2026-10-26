"use strict";

const STORAGE_KEY = "kantinkita-admin-menus-v1";
const initialMenus = [
  { id: 1, nama: "Nasi Goreng Kampus", kategori: "Makanan", harga: 12000, stok: 18, deskripsi: "Nasi goreng gurih dengan telur dan sayuran.", emoji: "🍛" },
  { id: 2, nama: "Ayam Geprek", kategori: "Makanan", harga: 15000, stok: 4, deskripsi: "Ayam renyah dengan sambal geprek.", emoji: "🍗" },
  { id: 3, nama: "Mie Goreng", kategori: "Makanan", harga: 10000, stok: 0, deskripsi: "Mie goreng dengan sayuran dan bumbu spesial.", emoji: "🍜" },
  { id: 4, nama: "Es Teh Manis", kategori: "Minuman", harga: 4000, stok: 25, deskripsi: "Teh manis dingin menyegarkan.", emoji: "🧋" },
  { id: 5, nama: "Jus Jeruk", kategori: "Minuman", harga: 7000, stok: 3, deskripsi: "Jus jeruk segar.", emoji: "🍊" },
  { id: 6, nama: "Pisang Goreng", kategori: "Camilan", harga: 6000, stok: 12, deskripsi: "Pisang goreng hangat dan renyah.", emoji: "🍌" }
];

const rupiah = value => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0
}).format(value);

let menus = loadMenus();
let toastTimeout;

function loadMenus() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.warn("Data menu lokal tidak dapat dibaca.", error);
  }
  return initialMenus.map(menu => ({ ...menu }));
}

function saveMenus() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
  } catch (error) {
    showToast("Browser tidak dapat menyimpan data. Periksa pengaturan penyimpanan.");
  }
}

function statusFor(stock) {
  if (stock <= 0) return { label: "Habis", className: "out" };
  if (stock <= 5) return { label: "Stok menipis", className: "low" };
  return { label: "Tersedia", className: "available" };
}

function renderStats() {
  document.querySelector("#total-menu").textContent = menus.length;
  document.querySelector("#available-menu").textContent = menus.filter(m => m.stok > 0).length;
  document.querySelector("#low-stock").textContent = menus.filter(m => m.stok > 0 && m.stok <= 5).length;
  document.querySelector("#out-stock").textContent = menus.filter(m => m.stok <= 0).length;
}

function renderMenus() {
  const query = document.querySelector("#search").value.trim().toLocaleLowerCase("id");
  const category = document.querySelector("#category-filter").value;
  const stockFilter = document.querySelector("#stock-filter").value;

  const filtered = menus.filter(menu => {
    const matchesQuery = menu.nama.toLocaleLowerCase("id").includes(query) ||
      menu.deskripsi.toLocaleLowerCase("id").includes(query);
    const matchesCategory = category === "Semua" || menu.kategori === category;
    const status = statusFor(menu.stok).className;
    const matchesStock = stockFilter === "Semua" ||
      (stockFilter === "available" && status === "available") ||
      (stockFilter === "low" && status === "low") ||
      (stockFilter === "out" && status === "out");
    return matchesQuery && matchesCategory && matchesStock;
  });

  const tbody = document.querySelector("#menu-table");
  tbody.replaceChildren();

  filtered.forEach(menu => {
    const status = statusFor(menu.stok);
    const tr = document.createElement("tr");

    const nameCell = document.createElement("td");
    const nameWrap = document.createElement("div");
    nameWrap.className = "menu-cell";
    const thumb = document.createElement("span");
    thumb.className = "food-thumb";
    thumb.textContent = menu.emoji || "🍽️";
    const nameInfo = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = menu.nama;
    const description = document.createElement("small");
    description.textContent = menu.deskripsi;
    nameInfo.append(name, description);
    nameWrap.append(thumb, nameInfo);
    nameCell.append(nameWrap);

    const categoryCell = document.createElement("td");
    const categoryPill = document.createElement("span");
    categoryPill.className = "category-pill";
    categoryPill.textContent = menu.kategori;
    categoryCell.append(categoryPill);

    const priceCell = document.createElement("td");
    priceCell.className = "price";
    priceCell.textContent = rupiah(menu.harga);

    const stockCell = document.createElement("td");
    stockCell.className = "stock-value";
    stockCell.textContent = `${menu.stok} porsi`;

    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = `badge ${status.className}`;
    badge.textContent = status.label;
    statusCell.append(badge);

    const actionCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "stock-actions";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "stock-btn";
    minus.textContent = "−";
    minus.title = `Kurangi stok ${menu.nama}`;
    minus.setAttribute("aria-label", `Kurangi stok ${menu.nama}`);
    minus.dataset.stockId = menu.id;
    minus.dataset.delta = "-1";
    minus.disabled = menu.stok <= 0;
    const count = document.createElement("small");
    count.textContent = "Stok";
    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "stock-btn";
    plus.textContent = "+";
    plus.title = `Tambah stok ${menu.nama}`;
    plus.setAttribute("aria-label", `Tambah stok ${menu.nama}`);
    plus.dataset.stockId = menu.id;
    plus.dataset.delta = "1";
    plus.disabled = menu.stok >= 999;
    actions.append(minus, count, plus);
    actionCell.append(actions);

    tr.append(nameCell, categoryCell, priceCell, stockCell, statusCell, actionCell);
    tbody.append(tr);
  });

  document.querySelector("#empty-state").hidden = filtered.length > 0;
  document.querySelector("#result-count").textContent =
    `Menampilkan ${filtered.length} dari ${menus.length} menu`;
  renderStats();
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2800);
}

function setError(id, message) {
  document.querySelector(`#${id}-error`).textContent = message;
}

function clearErrors() {
  ["name", "category", "price", "stock", "description"].forEach(id => setError(id, ""));
  const message = document.querySelector("#form-message");
  message.textContent = "";
  message.className = "form-message";
}

document.querySelector("#search").addEventListener("input", renderMenus);
document.querySelector("#category-filter").addEventListener("change", renderMenus);
document.querySelector("#stock-filter").addEventListener("change", renderMenus);

document.querySelector("#menu-table").addEventListener("click", event => {
  const button = event.target.closest("button[data-stock-id]");
  if (!button) return;
  const menu = menus.find(item => item.id === Number(button.dataset.stockId));
  if (!menu) return;

  const delta = Number(button.dataset.delta);
  const nextStock = menu.stok + delta;
  if (nextStock < 0 || nextStock > 999) return;

  menu.stok = nextStock;
  saveMenus();
  renderMenus();
  showToast(`Stok "${menu.nama}" diperbarui menjadi ${menu.stok}.`);
});

document.querySelector("#menu-form").addEventListener("reset", () => {
  setTimeout(clearErrors, 0);
});

document.querySelector("#menu-form").addEventListener("submit", event => {
  event.preventDefault();
  clearErrors();

  const name = document.querySelector("#menu-name").value.trim();
  const category = document.querySelector("#menu-category").value;
  const priceRaw = document.querySelector("#menu-price").value;
  const stockRaw = document.querySelector("#menu-stock").value;
  const description = document.querySelector("#menu-description").value.trim();

  const price = Number(priceRaw);
  const stock = Number(stockRaw);
  let valid = true;

  if (name.length < 2 || name.length > 70) {
    setError("name", "Nama menu harus berisi 2–70 karakter.");
    valid = false;
  } else if (menus.some(menu => menu.nama.toLocaleLowerCase("id") === name.toLocaleLowerCase("id"))) {
    setError("name", "Nama menu tersebut sudah terdaftar.");
    valid = false;
  }

  if (!["Makanan", "Minuman", "Camilan"].includes(category)) {
    setError("category", "Pilih kategori menu.");
    valid = false;
  }

  if (priceRaw === "" || !Number.isInteger(price) || price < 500 || price > 1000000) {
    setError("price", "Harga harus berupa angka Rp500–Rp1.000.000 dengan kelipatan Rp500.");
    valid = false;
  }

  if (stockRaw === "" || !Number.isInteger(stock) || stock < 0 || stock > 999) {
    setError("stock", "Stok harus berupa bilangan bulat 0–999.");
    valid = false;
  }

  if (description.length < 5 || description.length > 180) {
    setError("description", "Deskripsi harus berisi 5–180 karakter.");
    valid = false;
  }

  if (!valid) {
    document.querySelector("#form-message").textContent = "Periksa kembali kolom yang ditandai.";
    document.querySelector("#form-message").className = "form-message fail";
    return;
  }

  const emojiByCategory = { Makanan: "🍛", Minuman: "🥤", Camilan: "🍪" };
  const newMenu = {
    id: Date.now(),
    nama: name,
    kategori: category,
    harga: price,
    stok: stock,
    deskripsi: description,
    emoji: emojiByCategory[category]
  };

  menus.unshift(newMenu);
  saveMenus();
  renderMenus();

  event.target.reset();
  clearErrors();

  const message = document.querySelector("#form-message");
  message.textContent = `Menu "${newMenu.nama}" berhasil ditambahkan ke daftar.`;
  message.className = "form-message success";
  showToast("Menu baru berhasil ditambahkan.");
  document.querySelector("#menu-section").scrollIntoView({ behavior: "smooth", block: "start" });
});

renderMenus();

// Données simulées
let data = { artistes: [], oeuvres: [{ id: 1, titre: 'Nuit étoilée', artiste: 'Van Gogh', annee: 1889 }], expositions: [{ id: 1, nom: 'Expo Moderne', date: '2024-06-15', lieu: 'Paris' }] };
let currentEntity = '', editId = null, deleteTarget = null;

// Login
function login() {
    const u = document.getElementById('username').value, p = document.getElementById('password').value;
    if (u === 'admin' && p === 'admin') { 
        document.getElementById('login-screen').classList.remove('active'); 
        document.getElementById('app-screen').classList.add('active'); 
        init(); 
    }
    else alert('Identifiants incorrects');
}
function logout() { document.getElementById('app-screen').classList.remove('active'); document.getElementById('login-screen').classList.add('active'); }

// Navigation
function showView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(view).classList.add('active');
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    event.target.classList.add('active');
}

// Initialisation
async function init() {
    await fetchArtistes();
    renderAll();
    updateStats();
    renderChart();
}

// API Reqres (Artistes)
async function fetchArtistes() {
    try { const r = await fetch('https://reqres.in/api/users'); const d = await r.json(); data.artistes = d.data.map(u => ({ id: u.id, nom: u.first_name + ' ' + u.last_name, email: u.email })); }
    catch { data.artistes = []; }
}

// Affichage des tableaux
function renderAll() { render('artistes'); render('oeuvres'); render('expositions'); }
function render(entity) {
    const t = document.getElementById('table-' + entity), items = data[entity];
    const cols = entity === 'artistes' ? ['ID', 'Nom', 'Email', 'Actions'] : entity === 'oeuvres' ? ['ID', 'Titre', 'Artiste', 'Année', 'Actions'] : ['ID', 'Nom', 'Date', 'Lieu', 'Actions'];
    t.innerHTML = '<thead><tr>' + cols.map(c => '<th onclick="sort(\'' + entity + '\',\'' + c.toLowerCase() + '\')">' + c + '</th>').join('') + '</tr></thead><tbody>' +
        items.map(i => '<tr>' + (entity === 'artistes' ? `<td>${i.id}</td><td>${i.nom}</td><td>${i.email}</td>` : entity === 'oeuvres' ? `<td>${i.id}</td><td>${i.titre}</td><td>${i.artiste}</td><td>${i.annee}</td>` : `<td>${i.id}</td><td>${i.nom}</td><td>${i.date}</td><td>${i.lieu}</td>`) +
            '<td><button onclick="editItem(\'' + entity + '\',' + i.id + ')">✏️</button><button class="delete" onclick="deleteItem(\'' + entity + '\',' + i.id + ')">🗑️</button></td></tr>').join('') + '</tbody>';
}

// Recherche
function search(entity, q) {
    const t = document.getElementById('table-' + entity).getElementsByTagName('tbody')[0], rows = t.getElementsByTagName('tr');
    for (let r of rows) r.style.display = r.innerText.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
}

// Tri
function sort(entity, col) {
    const map = { id: 'id', nom: 'nom', email: 'email', titre: 'titre', artiste: 'artiste', année: 'annee', date: 'date', lieu: 'lieu' };
    data[entity].sort((a, b) => a[map[col]] > b[map[col]] ? 1 : -1);
    render(entity);
}

// Modal CRUD
function openModal(entity, id = null) {
    currentEntity = entity; editId = id;
    const m = document.getElementById('modal'), form = document.getElementById('crud-form');
    const item = id ? data[entity].find(i => i.id === id) : null;
    document.getElementById('modal-title').innerText = (id ? 'Modifier' : 'Ajouter') + ' - ' + entity;
    form.innerHTML = entity === 'artistes' ? `<input name="nom" placeholder="Nom" value="${item?.nom || ''}" required><input name="email" placeholder="Email" value="${item?.email || ''}" required>` :
        entity === 'oeuvres' ? `<input name="titre" placeholder="Titre" value="${item?.titre || ''}" required><input name="artiste" placeholder="Artiste" value="${item?.artiste || ''}" required><input name="annee" type="number" placeholder="Année" value="${item?.annee || ''}" required>` :
            `<input name="nom" placeholder="Nom" value="${item?.nom || ''}" required><input name="date" type="date" value="${item?.date || ''}" required><input name="lieu" placeholder="Lieu" value="${item?.lieu || ''}" required>`;
    form.innerHTML += '<button type="submit">Enregistrer</button>';
    m.classList.add('active');
}
function closeModal() { document.getElementById('modal').classList.remove('active'); }

// Soumission du formulaire
function submitForm(e) {
    e.preventDefault();
    const fd = new FormData(e.target), obj = Object.fromEntries(fd);
    if (editId) Object.assign(data[currentEntity].find(i => i.id === editId), obj);
    else { obj.id = data[currentEntity].length ? Math.max(...data[currentEntity].map(i => i.id)) + 1 : 1; data[currentEntity].push(obj); }
    closeModal(); renderAll(); updateStats();
}

// Suppression
function deleteItem(entity, id) { deleteTarget = { entity, id }; document.getElementById('confirm-modal').classList.add('active'); }
function confirmDelete() { data[deleteTarget.entity] = data[deleteTarget.entity].filter(i => i.id !== deleteTarget.id); closeConfirm(); renderAll(); updateStats(); }
function closeConfirm() { document.getElementById('confirm-modal').classList.remove('active'); }
function editItem(entity, id) { openModal(entity, id); }

// Stats & Chart
function updateStats() {
    document.getElementById('stat-artistes').innerText = data.artistes.length;
    document.getElementById('stat-oeuvres').innerText = data.oeuvres.length;
    document.getElementById('stat-expositions').innerText = data.expositions.length;
}
function renderChart() {
    new Chart(document.getElementById('chart'), { type: 'bar', data: { labels: ['Artistes', 'Œuvres', 'Expositions'], datasets: [{ label: 'Statistiques', data: [data.artistes.length, data.oeuvres.length, data.expositions.length], backgroundColor: ['#667eea', '#764ba2', '#f093fb'] }] }, options: { responsive: true, plugins: { legend: { display: false } } } });
}
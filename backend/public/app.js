const state = {
  token: localStorage.getItem('dprd_token'),
  refreshToken: localStorage.getItem('dprd_refresh'),
  user: null,
};

const element = (id) => document.getElementById(id);

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const setTokens = (data) => {
  state.token = data.token;
  state.refreshToken = data.refreshToken;
  localStorage.setItem('dprd_token', data.token);
  localStorage.setItem('dprd_refresh', data.refreshToken);
};

const clearSession = () => {
  state.token = null;
  state.refreshToken = null;
  state.user = null;
  localStorage.removeItem('dprd_token');
  localStorage.removeItem('dprd_refresh');
  element('dashboard').hidden = true;
  element('logout').hidden = true;
  element('login').hidden = false;
};

const authFetch = async (path, options = {}) => {
  const send = () =>
    fetch(path, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${state.token}` },
    });
  let response = await send();
  if (response.status === 401 && state.refreshToken) {
    const refreshed = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: state.refreshToken }),
    });
    if (!refreshed.ok) {
      clearSession();
      throw new Error('Sesi berakhir, silakan masuk kembali');
    }
    setTokens(await refreshed.json());
    response = await send();
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Gagal memuat data (${response.status})`);
  }
  return response;
};

const fillRekap = (rows) => {
  element('rekap-body').innerHTML = rows
    .map(
      (row) => `<tr>
        <td>${escapeHtml(row.nama)}</td>
        <td>${escapeHtml(row.fraksi)}</td>
        <td>${escapeHtml(row.partai)}</td>
        <td>${row.hadir}</td>
        <td>${row.izin}</td>
        <td>${row.alpha}</td>
        <td>${row.persentase_hadir}%</td>
      </tr>`
    )
    .join('');
  const fraksi = [...new Set(rows.map((row) => row.fraksi).filter(Boolean))].sort();
  const select = element('fraksi-filter');
  const selected = select.value;
  select.innerHTML = '<option value="">Semua</option>';
  for (const value of fraksi) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
  select.value = selected;
};

const fillAbsensi = (rows) => {
  element('absensi-body').innerHTML = rows
    .map(
      (row) => `<tr>
        <td>${escapeHtml(row.nama_anggota)}</td>
        <td>${escapeHtml(row.nama_rapat)}</td>
        <td>${escapeHtml(row.tanggal ? row.tanggal.slice(0, 10) : '-')}</td>
        <td>${escapeHtml(row.status)}</td>
        <td>${escapeHtml(row.jam_masuk || '-')}</td>
      </tr>`
    )
    .join('');
};

const loadDashboard = async () => {
  const fraksi = element('fraksi-filter').value;
  const query = fraksi ? `?limit=100&fraksi=${encodeURIComponent(fraksi)}` : '?limit=100';
  const [rekapResponse, absensiResponse] = await Promise.all([
    authFetch(`/api/absensi/rekap${query}`),
    authFetch('/api/absensi?limit=20'),
  ]);
  fillRekap((await rekapResponse.json()).data);
  fillAbsensi((await absensiResponse.json()).data);
};

const showDashboard = (user) => {
  state.user = user;
  element('login').hidden = true;
  element('dashboard').hidden = false;
  element('logout').hidden = false;
  element('user-info').textContent = `${user.nama} · ${user.role}`;
};

element('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const error = element('login-error');
  error.hidden = true;
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: element('email').value,
        password: element('password').value,
      }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Login gagal');
    setTokens(body);
    showDashboard(body.user);
    await loadDashboard();
  } catch (err) {
    error.textContent = err.message;
    error.hidden = false;
  }
});

element('fraksi-filter').addEventListener('change', () => {
  loadDashboard().catch((err) => {
    element('user-info').textContent = err.message;
  });
});

element('export').addEventListener('click', async () => {
  const fraksi = element('fraksi-filter').value;
  const query = fraksi ? `?fraksi=${encodeURIComponent(fraksi)}` : '';
  const response = await authFetch(`/api/absensi/rekap/csv${query}`);
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = 'rekap-absensi.csv';
  link.click();
  URL.revokeObjectURL(url);
});

element('logout').addEventListener('click', async () => {
  try {
    await authFetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: state.refreshToken }),
    });
  } catch (_err) {
    return clearSession();
  }
  clearSession();
});

if (state.token) {
  authFetch('/api/health')
    .then(() => showDashboard({ nama: 'Pengguna', role: 'anggota' }))
    .then(() => loadDashboard())
    .catch(() => clearSession());
}

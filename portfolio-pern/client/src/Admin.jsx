import { useEffect, useState } from 'react';

async function api(path, opts = {}) {
  const r = await fetch('/api' + path, { credentials: 'same-origin', ...opts });
  if (r.status === 204) return null;
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error || 'Request failed'), { status: r.status });
  return d;
}

// Centre-crop to a 640x640 square JPEG so uploads stay small and always fit the round frame.
function squareJpeg(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height);
      const c = document.createElement('canvas');
      c.width = c.height = 640;
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 640, 640);
      URL.revokeObjectURL(img.src);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/jpeg', 0.88);
    };
    img.onerror = () => reject(new Error('That file is not a valid image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function Admin() {
  const [authed, setAuthed] = useState(null);
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState({ hasPhoto: false });
  const [messages, setMessages] = useState([]);
  const [note, setNote] = useState({ text: '', ok: false });
  const [busy, setBusy] = useState(false);

  const say = (text, ok = false) => setNote({ text, ok });
  const loadProfile = () => api('/profile').then(setProfile);
  const loadAll = () => Promise.all([loadProfile(), api('/messages').then(setMessages)]);

  useEffect(() => {
    api('/me').then(() => { setAuthed(true); return loadAll(); }).catch(() => setAuthed(false));
  }, []);

  async function login(e) {
    e.preventDefault(); say('');
    try { await api('/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }); setPassword(''); setAuthed(true); await loadAll(); }
    catch (err) { say(err.message); }
  }
  async function logout() { await api('/logout', { method: 'POST' }); setAuthed(false); }

  async function onPick(e) {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    setBusy(true); say('');
    try {
      const blob = await squareJpeg(file);
      const fd = new FormData(); fd.append('photo', blob, 'photo.jpg');
      await api('/photo', { method: 'POST', body: fd });
      await loadProfile(); say('Photo updated. It is now live on your site.', true);
    } catch (err) { say(err.message); if (err.status === 401) setAuthed(false); }
    setBusy(false);
  }
  async function removePhoto() {
    if (!confirm('Remove your profile photo?')) return;
    await api('/photo', { method: 'DELETE' }); await loadProfile(); say('Photo removed.', true);
  }
  async function del(id) { await api('/messages/' + id, { method: 'DELETE' }); setMessages((m) => m.filter((x) => x.id !== id)); }

  if (authed === null) return <div className="adm"><p className="mu">Loading...</p></div>;

  if (!authed) return (
    <div className="adm" style={{ maxWidth: 420 }}>
      <form className="card form" style={{ margin: '12vh 0 0' }} onSubmit={login}>
        <h2 style={{ fontSize: 24 }}>Owner login</h2>
        <input type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" aria-label="Admin password" required />
        <button className="btn p" style={{ justifyContent: 'center' }}>Log in</button>
        {note.text && <p className="err" role="alert">{note.text}</p>}
        <a className="mu sm" href="/">Back to site</a>
      </form>
    </div>
  );

  return (
    <div className="adm">
      <div className="row" style={{ marginBottom: 18 }}><h2>Owner dashboard</h2><span><a href="/">View site</a> &nbsp;|&nbsp; <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Log out</a></span></div>

      <div className="card">
        <h3 style={{ fontSize: 18, marginBottom: 14 }}>Profile photo</h3>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="av" style={{ margin: 0 }}>{profile.hasPhoto ? <img src={`/api/photo?v=${profile.version}`} alt="Current profile" /> : <div aria-hidden="true">ST</div>}</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <label className="btn p" style={{ cursor: 'pointer' }}>
              {busy ? 'Uploading...' : profile.hasPhoto ? 'Change photo' : 'Upload photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} disabled={busy} hidden />
            </label>
            {profile.hasPhoto && <button className="btn" onClick={removePhoto}>Remove photo</button>}
            <small className="mu">JPG, PNG or WebP up to 3 MB. It is cropped to a square automatically.</small>
          </div>
        </div>
        {note.text && <p className={note.ok ? 'okk' : 'err'} role="status" style={{ marginTop: 12 }}>{note.text}</p>}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 18, marginBottom: 6 }}>Messages ({messages.length})</h3>
        {messages.length === 0 && <p className="mu sm">No messages yet.</p>}
        {messages.map((m) => (
          <div className="msg" key={m.id}>
            <div className="row"><b>{m.name}</b><span>{new Date(m.created_at).toLocaleString('en-IN')}</span></div>
            <a className="sm" href={'mailto:' + m.email}>{m.email}</a>
            <p>{m.body}</p>
            <button className="btn" onClick={() => del(m.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

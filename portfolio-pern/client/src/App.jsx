import { useEffect, useState } from 'react';
import { experience, projects, skills, certs } from './data.js';
import scene from './scene.js';

const Icon = ({ n }) => (<svg className="i"><use href={'#' + n} /></svg>);
const Section = ({ id, icon, title, children }) => (
  <section id={id}><div className="h"><span><Icon n={icon} /></span><h2>{title}</h2></div>{children}</section>
);
const Chips = ({ items }) => (<div className="chips">{items.map((t) => <span key={t}>{t}</span>)}</div>);

function Contact() {
  const [f, setF] = useState({ name: '', email: '', message: '' });
  const [state, setState] = useState({ busy: false, msg: '', ok: false });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function send(e) {
    e.preventDefault();
    setState({ busy: true, msg: '', ok: false });
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Could not send');
      setF({ name: '', email: '', message: '' });
      setState({ busy: false, msg: 'Message sent. Thank you!', ok: true });
    } catch (err) {
      setState({ busy: false, msg: err.message, ok: false });
    }
  }
  return (
    <form className="form" onSubmit={send}>
      <input placeholder="Your name" value={f.name} onChange={set('name')} maxLength={100} required aria-label="Your name" />
      <input type="email" placeholder="Your email" value={f.email} onChange={set('email')} maxLength={200} required aria-label="Your email" />
      <textarea rows={4} placeholder="Your message" value={f.message} onChange={set('message')} maxLength={2000} required aria-label="Your message" />
      <button className="btn p" disabled={state.busy} style={{ justifyContent: 'center' }}><Icon n="mail" />{state.busy ? 'Sending...' : 'Send message'}</button>
      {state.msg && <p className={state.ok ? 'okk' : 'err'} role="status">{state.msg}</p>}
    </form>
  );
}

export default function App() {
  const [profile, setProfile] = useState({ hasPhoto: false });
  useEffect(() => { fetch('/api/profile').then((r) => r.json()).then(setProfile).catch(() => {}); }, []);

  return (
    <>
      <div className="aur" aria-hidden="true"><i /><i /><i /></div>
      <nav>
        <a className="logo" href="#top"><b>ST</b>Sai Teja</a>
        <div>{[['about', 'About'], ['publication', 'Research'], ['experience', 'Experience'], ['projects', 'Projects'], ['skills', 'Skills'], ['contact', 'Contact']].map(([id, l]) => <a key={id} href={'#' + id}>{l}</a>)}</div>
      </nav>
      <main id="top">
        <header className="hero">
          <div>
            <div className="av">{profile.hasPhoto ? <img src={`/api/photo?v=${profile.version}`} alt="Sai Teja Bollapelli" /> : <div aria-hidden="true">ST</div>}</div>
            <h1>Sai Teja Bollapelli</h1>
            <p className="role">Full-stack engineer and computer vision researcher</p>
            <p className="lead">B.Tech Computer Science graduate who builds production web platforms and AI systems that help people. Published researcher, ready to take on a Master's programme in Computer Science.</p>
            <div className="btns">
              <a className="btn p" href="#publication"><Icon n="doc" />Read my research</a>
              <a className="btn" href="#contact"><Icon n="mail" />Get in touch</a>
            </div>
            <div className="stats">
              {[['1', 'peer-reviewed paper'], ['96%', 'CNN validation accuracy'], ['150+', 'LeetCode problems'], ['2', 'software internships']].map(([b, s]) => <div key={s}><b>{b}</b><small>{s}</small></div>)}
            </div>
          </div>
          <div className="scene" role="img" aria-label="Illustration of YOLOv8 detecting a car, bus, person and bicycle on a street" dangerouslySetInnerHTML={{ __html: scene }} />
        </header>

        <Section id="about" icon="user" title="About me">
          <div className="grid">
            <div className="card">
              <p style={{ marginTop: 0 }}>I turn ideas into working products, from PostgreSQL schemas and secure APIs to real-time chat and computer vision models. My strongest work sits where software engineering meets machine learning.</p>
              <p className="mu sm" style={{ marginBottom: 0 }}>I enjoy owning a feature end to end, from design to deployment, and I learn new tools quickly in Agile teams.</p>
            </div>
            <div className="card">
              <p className="sm" style={{ margin: '0 0 10px' }}><Icon n="pin" /> Warangal, Telangana, India</p>
              <p className="sm" style={{ margin: '0 0 10px' }}><Icon n="cap" /> B.Tech Computer Science, CGPA 7.75</p>
              <p className="sm" style={{ margin: 0 }}><Icon n="spark" /> Next goal: Master's in Computer Science, focused on AI and software engineering</p>
            </div>
          </div>
        </Section>

        <Section id="publication" icon="doc" title="Published research">
          <div className="card pub">
            <div>
              <span className="tag"><Icon n="award" />Peer-reviewed, accepted April 2026</span>
              <h3>AI-Enabled Real-Time Environmental Awareness and Guidance System for Visually Impaired Users</h3>
              <p className="mu sm" style={{ margin: 0 }}>CH. Naresh, SK. Ruksana, P. Krishna Priyatham, B. Sai Teja. <i>Communications on Applied Nonlinear Analysis</i>, Vol. 33, No. 1s, pp. 388 to 396, 2026.</p>
              <ul className="sm">
                <li>Real-time pipeline with YOLOv8 and OpenCV for obstacle detection, direction and distance estimation, and a rule-based risk engine.</li>
                <li>Multilingual spoken guidance with gTTS, tested indoors and outdoors.</li>
                <li>I contributed across multiple modules and to overall system integration.</li>
              </ul>
              <Chips items={['YOLOv8', 'OpenCV', 'Python', 'gTTS']} />
            </div>
            <div className="rings" aria-label="Reported accuracy: direction 0.80, distance 0.75, path clearance 0.89">
              {[['0.80', 'Direction accuracy', 'var(--a)', 43], ['0.75', 'Distance accuracy', 'var(--b)', 53], ['0.89', 'Path clearance', 'var(--c)', 24]].map(([v, l, c, o]) => (
                <div key={l}><svg viewBox="0 0 80 80"><circle className="t" cx="40" cy="40" r="34" /><circle className="v" cx="40" cy="40" r="34" stroke={c} style={{ '--o': o }} /></svg><b>{v}</b><small>{l}</small></div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="experience" icon="job" title="Experience">
          <div className="tl">
            {experience.map((e) => (
              <div className="card" key={e.title}>
                <div className="dot"><Icon n={e.icon} /></div>
                <div className="row"><h3>{e.title}</h3><span>{e.when}</span></div>
                <ul className="sm">{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
            ))}
          </div>
        </Section>

        <Section id="projects" icon="lay" title="Projects">
          <div className="grid">
            {projects.map((p) => (
              <div className={'card pj' + (p.wide ? ' wide' : '')} key={p.title}>
                <div className="ic" style={{ background: `linear-gradient(135deg,${p.grad})` }}><Icon n={p.icon} /></div>
                <div className="row"><h3>{p.title}</h3><span>{p.when}</span></div>
                <p className="mu sm" style={{ margin: '6px 0 0' }}>{p.blurb}</p>
                {p.points && <ul className="sm">{p.points.map((x) => <li key={x}>{x}</li>)}</ul>}
                <Chips items={p.tags} />
              </div>
            ))}
          </div>
        </Section>

        <Section id="skills" icon="chip" title="Skills and tools">
          <div className="grid">{skills.map((s) => <div className="card sk" key={s.title}><h3><Icon n={s.icon} />{s.title}</h3><Chips items={s.items} /></div>)}</div>
        </Section>

        <Section id="education" icon="cap" title="Education and certifications">
          <div className="grid">
            <div className="card"><div className="row"><h3>Vignan Institute of Technology and Science</h3><span>Nov 2022 to Apr 2026</span></div><p className="mu sm" style={{ margin: '6px 0 0' }}>B.Tech in Computer Science, CGPA 7.75</p></div>
            <div className="card"><div className="row"><h3>Narayana Junior College</h3><span>Jun 2020 to May 2022</span></div><p className="mu sm" style={{ margin: '6px 0 0' }}>Intermediate, 87%</p></div>
          </div>
          <div className="grid" style={{ marginTop: 18 }}>
            {certs.map(([t, s]) => <div className="card cert" key={t}><Icon n="award" /><div><b>{t}</b><span className="mu sm">{s}</span></div></div>)}
          </div>
        </Section>

        <section id="contact">
          <div className="card contact">
            <h2>Let's build something useful together</h2>
            <p className="mu" style={{ margin: 0 }}>Open to Master's admissions, research collaborations and engineering roles.</p>
            <Contact />
            <div className="btns">
              <a className="btn" href="mailto:saitejabollapelli09@gmail.com"><Icon n="mail" />saitejabollapelli09@gmail.com</a>
              <a className="btn" href="tel:+919392504725"><Icon n="phone" />+91-9392504725</a>
              <a className="btn" href="https://linkedin.com/"><Icon n="in" />LinkedIn</a>
              <a className="btn" href="https://github.com/"><Icon n="gh" />GitHub</a>
              <a className="btn" href="https://leetcode.com/"><Icon n="code" />LeetCode</a>
            </div>
          </div>
        </section>
      </main>
      <footer>&copy; 2026 Sai Teja Bollapelli. Warangal, Telangana, India.</footer>
    </>
  );
}

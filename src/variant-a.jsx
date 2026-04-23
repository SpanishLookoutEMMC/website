// Variant A — "Parish bulletin"
// Classical editorial take. Cormorant Garamond display, Inter body.
// Two-column layout with a masthead rule, thin hairlines, small-caps
// section labels. Hero is the worship-service photo with a quiet welcome
// overlaid at the bottom-left. Deep forest green as the single anchor color.

function VariantA({ tweaks }) {
  const t = tweaks || {};
  const ink = t.ink || '#1f3a2e';
  const cream = t.cream || '#f5f0e6';
  const text = '#2a2520';
  const muted = 'rgba(42,37,32,0.62)';
  const display = t.display || 'Cormorant Garamond';
  const body = t.body || 'Inter';

  const container = {
    background: cream,
    color: text,
    fontFamily: `${body}, system-ui, sans-serif`,
    width: '100%',
    minHeight: '100%',
    fontSize: 15,
    lineHeight: 1.55,
  };

  const maxW = 1120;

  return (
    <div style={container}>
      {/* Masthead */}
      <div style={{ borderBottom: `1px solid ${ink}22` }}>
        <div style={{ maxWidth: maxW, margin: '0 auto', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Logo height={30} />
            <div style={{ borderLeft: `1px solid ${ink}33`, height: 28 }} />
            <div>
              <div style={{ fontFamily: display, fontSize: 20, fontWeight: 500, color: ink, lineHeight: 1, letterSpacing: '0.01em' }}>Spanish Lookout</div>
              <div style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: muted, marginTop: 3 }}>EMMC · Est. in Christ</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 28, fontSize: 13, color: text }}>
            {['The Church', 'Sermons', 'Our Faith', 'Membership', 'News', 'Contact'].map((n) => (
              <a key={n} href="#" style={{ color: text, textDecoration: 'none', borderBottom: '1px solid transparent' }}>{n}</a>
            ))}
          </nav>
          <a href="#" style={{
            fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: ink, textDecoration: 'none',
            borderBottom: `1px solid ${ink}`,
            paddingBottom: 2,
          }}>Visit Sunday →</a>
        </div>
      </div>

      {/* Top strip: news ticker */}
      <div style={{ background: ink, color: cream }}>
        <div style={{ maxWidth: maxW, margin: '0 auto', padding: '9px 40px', display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
          <SmallCaps style={{ color: '#d9c89a', opacity: 0.9 }}>Latest News</SmallCaps>
          <div style={{ width: 1, height: 12, background: '#d9c89a33' }} />
          <span style={{ opacity: 0.92 }}>{NEWS[0].title}</span>
          <span style={{ opacity: 0.55, marginLeft: 'auto' }}>{NEWS[0].date}</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative' }}>
        <div style={{
          height: 540,
          width: '100%',
          backgroundImage: `url(images/congregation-worship-service-sunset.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(180deg, rgba(15,20,18,0.25) 0%, rgba(15,20,18,0.15) 40%, rgba(15,20,18,0.75) 100%)`,
          }} />
          <div style={{ position: 'absolute', inset: 0, maxWidth: maxW, margin: '0 auto', padding: '0 40px' }}>
            <div style={{ position: 'absolute', left: 40, right: 40, bottom: 48, color: '#f6f1e4' }}>
              <SmallCaps style={{ color: '#d9c89a', opacity: 0.95 }}>A welcome</SmallCaps>
              <div style={{
                fontFamily: display,
                fontSize: 66,
                lineHeight: 1.04,
                fontWeight: 400,
                marginTop: 14,
                letterSpacing: '-0.01em',
                maxWidth: 820,
                textWrap: 'pretty',
              }}>
                <em style={{ fontStyle: 'italic', fontWeight: 400 }}>“Come to me,</em> all you who are weary and burdened, and&nbsp;I&nbsp;will give&nbsp;you&nbsp;rest.”
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 18, opacity: 0.85 }}>
                <div style={{ width: 32, height: 1, background: '#d9c89a' }} />
                <SmallCaps style={{ color: '#d9c89a' }}>Matthew 11:28</SmallCaps>
              </div>
            </div>
          </div>
        </div>

        {/* Service card overhanging the hero */}
        <div style={{ maxWidth: maxW, margin: '-64px auto 0', padding: '0 40px', position: 'relative', zIndex: 2 }}>
          <div style={{
            background: cream,
            border: `1px solid ${ink}22`,
            padding: '28px 36px',
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr 1fr auto',
            gap: 36,
            alignItems: 'center',
            boxShadow: '0 14px 40px rgba(20,25,20,0.18)',
          }}>
            <div>
              <SmallCaps style={{ color: muted }}>Sunday Service</SmallCaps>
              <div style={{ fontFamily: display, fontSize: 34, color: ink, lineHeight: 1.02, marginTop: 6 }}>10:00 in the morning</div>
              <div style={{ color: muted, marginTop: 4, fontSize: 13 }}>Every Sunday, all year. Everyone is welcome.</div>
            </div>
            <div>
              <SmallCaps style={{ color: muted }}>Find us</SmallCaps>
              <div style={{ fontFamily: display, fontSize: 22, color: ink, marginTop: 6, lineHeight: 1.2 }}>Spanish Lookout,<br/>Cayo District, Belize</div>
            </div>
            <div>
              <SmallCaps style={{ color: muted }}>Pastor</SmallCaps>
              <div style={{ fontFamily: display, fontSize: 22, color: ink, marginTop: 6 }}>Blaine Dueck</div>
              <div style={{ color: muted, fontSize: 12, marginTop: 2 }}>Teaching · Shepherding</div>
            </div>
            <a href="#" style={{
              alignSelf: 'stretch',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 22px',
              background: ink, color: cream,
              fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
              textDecoration: 'none',
              fontWeight: 500,
            }}>Plan a Visit →</a>
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div style={{ maxWidth: maxW, margin: '0 auto', padding: '90px 40px 0', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 64 }}>
        {/* Left column: sermon + list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <SmallCaps style={{ color: muted }}>Latest Sermon</SmallCaps>
              <div style={{ fontFamily: display, fontSize: 36, color: ink, marginTop: 6, lineHeight: 1.05 }}>He Is Risen Indeed</div>
              <div style={{ color: muted, fontSize: 13, marginTop: 2 }}>Blaine Dueck · April 19, 2026 · 38 min</div>
            </div>
            <a href="#" style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink, textDecoration: 'none', borderBottom: `1px solid ${ink}55`, paddingBottom: 2 }}>All sermons →</a>
          </div>
          <VideoPlaceholder title="He Is Risen Indeed — Easter 2026" subtitle="YouTube · latest sermon" accent={ink} />

          <div style={{ marginTop: 40 }}>
            <SmallCaps style={{ color: muted }}>Recent messages</SmallCaps>
            <HairRule color={ink} opacity={0.2} style={{ marginTop: 8, marginBottom: 4 }} />
            {SERMONS.slice(1).map((s) => (
              <div key={s.title} style={{
                display: 'grid',
                gridTemplateColumns: '92px 1fr auto',
                gap: 20,
                alignItems: 'baseline',
                padding: '14px 0',
                borderBottom: `1px solid ${ink}18`,
              }}>
                <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: muted }}>{s.date}</div>
                <div>
                  <div style={{ fontFamily: display, fontSize: 20, color: ink, lineHeight: 1.2 }}>{s.title}</div>
                  <div style={{ color: muted, fontSize: 12, marginTop: 2 }}>{s.speaker} · {s.series}</div>
                </div>
                <div style={{ fontSize: 12, color: muted, fontVariantNumeric: 'tabular-nums' }}>{s.duration}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: welcome letter + address card */}
        <aside>
          <SmallCaps style={{ color: muted }}>Our Church</SmallCaps>
          <div style={{ fontFamily: display, fontSize: 30, color: ink, marginTop: 6, lineHeight: 1.1 }}>A small fellowship in&nbsp;the heart of Belize.</div>
          <HairRule color={ink} opacity={0.18} style={{ margin: '18px 0 18px' }} />
          <p style={{ color: text, fontSize: 14.5, lineHeight: 1.7, marginTop: 0, textWrap: 'pretty' }}>
            Spanish Lookout EMMC is a Mennonite congregation gathered each Sunday to worship Jesus,
            open the scriptures together, and encourage one another in the life of faith.
            We are part of the wider Evangelical Mennonite Mission Conference family of churches.
          </p>
          <p style={{ color: text, fontSize: 14.5, lineHeight: 1.7, marginBottom: 0, textWrap: 'pretty', fontStyle: 'italic' }}>
            Whether you are visiting the community, new to the faith, or have walked a long road —
            there is a seat for you on Sunday morning.
          </p>

          <div style={{ marginTop: 32, border: `1px solid ${ink}22`, padding: 22 }}>
            <SmallCaps style={{ color: muted }}>Gather with us</SmallCaps>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: muted }}>When</div>
                <div style={{ fontFamily: display, fontSize: 20, color: ink }}>Sundays · 10 AM</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>Where</div>
                <div style={{ fontFamily: display, fontSize: 20, color: ink, lineHeight: 1.15 }}>Spanish Lookout<br/>Belize</div>
              </div>
            </div>
            <HairRule color={ink} opacity={0.2} style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <a href={CHURCH.gmaps} style={{ color: ink, textDecoration: 'none' }}>→ Open in Google Maps</a>
              <a href={CHURCH.youtube} style={{ color: ink, textDecoration: 'none' }}>→ Watch on YouTube</a>
              <a href={`mailto:${CHURCH.email}`} style={{ color: ink, textDecoration: 'none' }}>→ Email Blaine</a>
            </div>
          </div>

          {/* Small photo */}
          <div style={{
            marginTop: 28,
            width: '100%',
            aspectRatio: '4 / 3',
            backgroundImage: 'url(images/church-exterior-dusk-palm-trees.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
          <div style={{ fontSize: 11, color: muted, marginTop: 8, fontStyle: 'italic' }}>The meeting house at dusk · Cayo District</div>
        </aside>
      </div>

      {/* Faith strip */}
      <div style={{ marginTop: 96, borderTop: `1px solid ${ink}22`, borderBottom: `1px solid ${ink}22`, background: `${ink}0a` }}>
        <div style={{ maxWidth: maxW, margin: '0 auto', padding: '56px 40px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 48, alignItems: 'start' }}>
          <div>
            <SmallCaps style={{ color: muted }}>What we believe</SmallCaps>
            <div style={{ fontFamily: display, fontSize: 34, color: ink, marginTop: 8, lineHeight: 1.08 }}>A simple, shared faith.</div>
            <a href="#" style={{
              display: 'inline-block', marginTop: 18,
              fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: ink, textDecoration: 'none', borderBottom: `1px solid ${ink}`, paddingBottom: 2,
            }}>Our statement of faith →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {[
              { h: 'Encourage', b: 'Walking with one another through the ordinary and extraordinary seasons of life.' },
              { h: 'Equip', b: 'Opening the scriptures so that every believer can grow into the fullness of Christ.' },
              { h: 'Send', b: 'Joining God\u2019s mission locally and globally, in word and in quiet service.' },
            ].map((c) => (
              <div key={c.h}>
                <div style={{ fontFamily: display, fontSize: 22, color: ink, fontStyle: 'italic' }}>{c.h}.</div>
                <HairRule color={ink} opacity={0.2} style={{ margin: '10px 0' }} />
                <div style={{ fontSize: 13.5, color: text, lineHeight: 1.6 }}>{c.b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* News strip */}
      <div style={{ maxWidth: maxW, margin: '0 auto', padding: '72px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <SmallCaps style={{ color: muted }}>From the church</SmallCaps>
            <div style={{ fontFamily: display, fontSize: 34, color: ink, marginTop: 6 }}>Latest news</div>
          </div>
          <a href="#" style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink, textDecoration: 'none', borderBottom: `1px solid ${ink}55`, paddingBottom: 2 }}>All news →</a>
        </div>
        <HairRule color={ink} opacity={0.2} style={{ margin: '24px 0' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
          {NEWS.map((n) => (
            <div key={n.title}>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: muted }}>{n.date}</div>
              <div style={{ fontFamily: display, fontSize: 22, color: ink, marginTop: 8, lineHeight: 1.25, textWrap: 'pretty' }}>{n.title}</div>
              <a href="#" style={{ display: 'inline-block', marginTop: 14, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: ink, textDecoration: 'none', borderBottom: `1px solid ${ink}55`, paddingBottom: 2 }}>Read →</a>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: ink, color: '#e9e1ce', marginTop: 40 }}>
        <div style={{ maxWidth: maxW, margin: '0 auto', padding: '52px 40px 30px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 }}>
          <div>
            <Logo height={28} mono={true} style={{ filter: 'invert(1) brightness(1.6)' }} />
            <div style={{ marginTop: 14, fontFamily: display, fontSize: 20, color: '#f0e8d1' }}>Spanish Lookout EMMC</div>
            <div style={{ fontSize: 13, color: '#e9e1ce99', marginTop: 6, maxWidth: 320 }}>A Mennonite congregation in Spanish Lookout, Cayo District, Belize.</div>
          </div>
          <div>
            <SmallCaps style={{ color: '#d9c89a' }}>Gather</SmallCaps>
            <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.9 }}>Sundays · 10 AM<br/>All welcome</div>
          </div>
          <div>
            <SmallCaps style={{ color: '#d9c89a' }}>Visit</SmallCaps>
            <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.9 }}>Spanish Lookout<br/>Cayo, Belize</div>
          </div>
          <div>
            <SmallCaps style={{ color: '#d9c89a' }}>Contact</SmallCaps>
            <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.9 }}>{CHURCH.email}<br/>{CHURCH.phone}</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ maxWidth: maxW, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#e9e1ce66' }}>
            <span>© 2026 Spanish Lookout EMMC</span>
            <span>Evangelical Mennonite Mission Conference</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

window.VariantA = VariantA;

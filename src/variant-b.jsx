// Variant B — "Quiet & spacious, typographic"
// Minimal, airy, heavy on type. Cormorant Garamond display at very large
// sizes. The hero is a single off-white screen with a scripture fragment
// and a thin service strip; photos live below as a restrained gallery.
// Navy ink (instead of forest green) so the three variants read distinctly.

function VariantB({ tweaks }) {
  const t = tweaks || {};
  const ink = t.ink || '#1a2942';
  const cream = t.cream || '#faf7f1';
  const text = '#1f1b15';
  const muted = 'rgba(31,27,21,0.55)';
  const display = t.display || 'Cormorant Garamond';
  const body = t.body || 'Inter';

  const maxW = 1120;

  const container = {
    background: cream,
    color: text,
    fontFamily: `${body}, system-ui, sans-serif`,
    width: '100%',
    minHeight: '100%',
    fontSize: 15,
    lineHeight: 1.55,
  };

  return (
    <div style={container}>
      {/* Thin top nav */}
      <div style={{ position: 'relative' }}>
        <div style={{ maxWidth: maxW, margin: '0 auto', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo height={26} />
          <nav style={{ display: 'flex', gap: 34, fontSize: 13 }}>
            {['Church', 'Sermons', 'Faith', 'Membership', 'News', 'Contact'].map((n, i) => (
              <a key={n} href="#" style={{ color: text, textDecoration: 'none', opacity: i === 0 ? 1 : 0.7 }}>{n}</a>
            ))}
          </nav>
        </div>
        <HairRule color={ink} opacity={0.14} />
      </div>

      {/* Quiet hero — all type */}
      <div style={{ maxWidth: maxW, margin: '0 auto', padding: '120px 40px 80px', position: 'relative' }}>
        <SmallCaps style={{ color: muted }}>Spanish Lookout · Cayo District · Belize</SmallCaps>
        <div style={{
          fontFamily: display,
          fontSize: 140,
          lineHeight: 0.92,
          fontWeight: 400,
          color: ink,
          letterSpacing: '-0.02em',
          marginTop: 32,
          textWrap: 'balance',
        }}>
          <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Be&nbsp;still,</em>
          <br />
          and know.
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 28 }}>
          <div style={{ width: 48, height: 1, background: ink, opacity: 0.4 }} />
          <SmallCaps style={{ color: muted }}>Psalm 46:10</SmallCaps>
        </div>

        <div style={{ marginTop: 72, display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr 1fr', gap: 36, alignItems: 'start', borderTop: `1px solid ${ink}22`, paddingTop: 36 }}>
          <div>
            <SmallCaps style={{ color: muted }}>Welcome</SmallCaps>
            <div style={{ fontFamily: display, fontSize: 26, color: ink, marginTop: 10, lineHeight: 1.18, textWrap: 'pretty' }}>
              We are a small Mennonite fellowship. You are welcome at our table.
            </div>
          </div>
          <div>
            <SmallCaps style={{ color: muted }}>Gather</SmallCaps>
            <div style={{ fontFamily: display, fontSize: 26, color: ink, marginTop: 10 }}>Sundays</div>
            <div style={{ fontFamily: display, fontSize: 26, color: ink, fontStyle: 'italic' }}>10 o'clock</div>
          </div>
          <div>
            <SmallCaps style={{ color: muted }}>Find us</SmallCaps>
            <div style={{ fontFamily: display, fontSize: 22, color: ink, marginTop: 10, lineHeight: 1.25 }}>Spanish Lookout,<br/>Cayo District</div>
            <a href={CHURCH.gmaps} style={{ fontSize: 12, color: ink, textDecoration: 'none', borderBottom: `1px solid ${ink}55`, marginTop: 10, display: 'inline-block', paddingBottom: 2 }}>Google Maps →</a>
          </div>
          <div>
            <SmallCaps style={{ color: muted }}>Contact</SmallCaps>
            <div style={{ fontFamily: display, fontSize: 22, color: ink, marginTop: 10 }}>Blaine Dueck</div>
            <div style={{ fontSize: 13, color: text, opacity: 0.75, marginTop: 2 }}>{CHURCH.email}</div>
          </div>
        </div>
      </div>

      {/* Full-bleed photo strip */}
      <div style={{
        width: '100%',
        height: 520,
        backgroundImage: 'url(images/church-exterior-dusk-palm-trees.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 55%',
      }} />
      <div style={{ maxWidth: maxW, margin: '0 auto', padding: '14px 40px 0' }}>
        <div style={{ fontSize: 11, color: muted, fontStyle: 'italic' }}>The meeting house, Spanish Lookout · Cayo District, Belize</div>
      </div>

      {/* Latest sermon: wide player with list */}
      <div style={{ maxWidth: maxW, margin: '0 auto', padding: '110px 40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <SmallCaps style={{ color: muted }}>Sermons</SmallCaps>
          <a href="#" style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink, textDecoration: 'none', borderBottom: `1px solid ${ink}55`, paddingBottom: 2 }}>Archive →</a>
        </div>
        <div style={{
          fontFamily: display, fontSize: 54, color: ink, marginTop: 10, lineHeight: 1.02, letterSpacing: '-0.01em', maxWidth: 720,
        }}>
          <em style={{ fontStyle: 'italic', fontWeight: 400 }}>He is risen,</em> indeed.
        </div>
        <div style={{ fontSize: 13, color: muted, marginTop: 10 }}>Blaine Dueck · April 19, 2026 · 38 minutes</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 40, marginTop: 36, alignItems: 'start' }}>
          <VideoPlaceholder title="He Is Risen Indeed — Easter 2026" subtitle="YouTube · latest sermon" accent={ink} />
          <div>
            <SmallCaps style={{ color: muted }}>Recent</SmallCaps>
            <HairRule color={ink} opacity={0.18} style={{ marginTop: 8 }} />
            {SERMONS.slice(1).map((s) => (
              <div key={s.title} style={{ padding: '14px 0', borderBottom: `1px solid ${ink}14` }}>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: muted }}>{s.date}</div>
                <div style={{ fontFamily: display, fontSize: 20, color: ink, marginTop: 4, lineHeight: 1.2 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{s.speaker}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Faith quote — big pull quote, no card */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '160px 40px 140px', textAlign: 'center' }}>
        <SmallCaps style={{ color: muted }}>What we believe</SmallCaps>
        <div style={{
          fontFamily: display, fontSize: 52, color: ink, marginTop: 24, lineHeight: 1.14, fontWeight: 400,
          fontStyle: 'italic', letterSpacing: '-0.005em', textWrap: 'balance',
        }}>
          “Jesus is Lord. The scriptures are true. The church is His body, and we are learning to love one another well.”
        </div>
        <div style={{ marginTop: 28, display: 'inline-flex', alignItems: 'baseline', gap: 14 }}>
          <div style={{ width: 32, height: 1, background: ink, opacity: 0.35 }} />
          <SmallCaps style={{ color: muted }}>Our statement of faith</SmallCaps>
          <div style={{ width: 32, height: 1, background: ink, opacity: 0.35 }} />
        </div>
      </div>

      {/* News strip — compact */}
      <div style={{ borderTop: `1px solid ${ink}22`, borderBottom: `1px solid ${ink}22` }}>
        <div style={{ maxWidth: maxW, margin: '0 auto', padding: '28px 40px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 32, alignItems: 'center' }}>
          <SmallCaps style={{ color: muted }}>Latest News</SmallCaps>
          <div style={{ fontFamily: display, fontSize: 22, color: ink, lineHeight: 1.2 }}>
            {NEWS[0].title} <span style={{ color: muted, fontSize: 14, marginLeft: 12, fontFamily: body, letterSpacing: '0.02em' }}>{NEWS[0].date}</span>
          </div>
          <a href="#" style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink, textDecoration: 'none', borderBottom: `1px solid ${ink}55`, paddingBottom: 2 }}>All news →</a>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '80px 40px 48px' }}>
        <div style={{ maxWidth: maxW, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 48 }}>
          <div>
            <Logo height={26} />
            <div style={{ fontFamily: display, fontSize: 22, color: ink, marginTop: 18, lineHeight: 1.2 }}>Spanish Lookout EMMC</div>
            <div style={{ fontSize: 13, color: muted, marginTop: 10, maxWidth: 300 }}>A Mennonite congregation in Spanish Lookout, Belize. Part of the EMMC family of churches.</div>
          </div>
          <div>
            <SmallCaps style={{ color: muted }}>Gather</SmallCaps>
            <div style={{ fontFamily: display, fontSize: 18, color: ink, marginTop: 10 }}>Sundays · 10 AM</div>
          </div>
          <div>
            <SmallCaps style={{ color: muted }}>Find us</SmallCaps>
            <div style={{ fontFamily: display, fontSize: 18, color: ink, marginTop: 10, lineHeight: 1.25 }}>Spanish Lookout, Belize</div>
          </div>
          <div>
            <SmallCaps style={{ color: muted }}>Contact</SmallCaps>
            <div style={{ fontSize: 14, color: text, marginTop: 10, lineHeight: 1.9 }}>{CHURCH.email}<br/>{CHURCH.phone}</div>
          </div>
        </div>
        <div style={{ maxWidth: maxW, margin: '52px auto 0', paddingTop: 18, borderTop: `1px solid ${ink}22`, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: muted }}>
          <span>© 2026 Spanish Lookout EMMC</span>
          <span>Evangelical Mennonite Mission Conference</span>
        </div>
      </footer>
    </div>
  );
}

window.VariantB = VariantB;

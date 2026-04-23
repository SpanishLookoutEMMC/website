// Variant C — "Scripture-forward, photo-driven"
// Boldest of the three. A full-bleed cinematic worship photo hero with a
// centered scripture, then the whole page reads as a vertical scroll-story:
// service info card, large sermon, photo-quilt, faith triptych, news.
// Uses EB Garamond + Lora for a slightly bookier, warmer pairing.
// Deep forest green inked against warm cream; tiny gold accent rule.

function VariantC({ tweaks }) {
  const t = tweaks || {};
  const ink = t.ink || '#263a2b';
  const cream = t.cream || '#f5efdf';
  const gold = t.gold || '#a88a4a';
  const text = '#2a2520';
  const muted = 'rgba(42,37,32,0.6)';
  const display = t.display || 'EB Garamond';
  const body = t.body || 'Lora';

  const maxW = 1160;

  const container = {
    background: cream,
    color: text,
    fontFamily: `${body}, Georgia, serif`,
    width: '100%',
    minHeight: '100%',
    fontSize: 15.5,
    lineHeight: 1.6,
  };

  return (
    <div style={container}>
      {/* Full-bleed hero */}
      <div style={{
        position: 'relative',
        height: 780,
        width: '100%',
        overflow: 'hidden',
        backgroundImage: 'url(images/congregation-worship-service-sunset.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 35%',
        color: '#f3ead2',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, rgba(15,20,15,0.55) 0%, rgba(15,20,15,0.2) 35%, rgba(15,20,15,0.65) 100%)`,
        }} />

        {/* Top nav over photo */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: maxW, margin: '0 auto', padding: '26px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Logo height={28} style={{ filter: 'brightness(0) invert(1)', opacity: 0.95 }} />
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', height: 26 }} />
              <div style={{ fontFamily: display, fontSize: 18, fontWeight: 500, letterSpacing: '0.01em' }}>Spanish Lookout EMMC</div>
            </div>
            <nav style={{ display: 'flex', gap: 30, fontSize: 13 }}>
              {['Church', 'Sermons', 'Faith', 'Membership', 'News', 'Contact'].map((n) => (
                <a key={n} href="#" style={{ color: '#f3ead2', textDecoration: 'none', opacity: 0.9 }}>{n}</a>
              ))}
            </nav>
          </div>
        </div>

        {/* Centered scripture */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 40px',
        }}>
          <div style={{ width: 42, height: 1, background: gold, opacity: 0.9 }} />
          <SmallCaps style={{ color: gold, marginTop: 22 }}>Welcome to Spanish Lookout EMMC</SmallCaps>
          <div style={{
            fontFamily: display,
            fontSize: 82,
            lineHeight: 1.04,
            fontWeight: 400,
            marginTop: 28,
            letterSpacing: '-0.01em',
            maxWidth: 960,
            textWrap: 'balance',
          }}>
            <em style={{ fontStyle: 'italic', fontWeight: 400 }}>“Enter his gates</em> with thanksgiving, and his courts with praise.”
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 28, opacity: 0.9 }}>
            <div style={{ width: 28, height: 1, background: gold }} />
            <SmallCaps style={{ color: gold }}>Psalm 100:4</SmallCaps>
            <div style={{ width: 28, height: 1, background: gold }} />
          </div>
        </div>

        {/* Bottom service strip */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,18,12,0.75) 100%)' }}>
          <div style={{ maxWidth: maxW, margin: '0 auto', padding: '28px 40px 26px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, color: '#f3ead2' }}>
            {[
              ['Service', 'Sundays · 10 AM'],
              ['Location', 'Spanish Lookout, Belize'],
              ['Pastor', 'Blaine Dueck'],
              ['Welcome', 'All are welcome — come as you are'],
            ].map(([k, v]) => (
              <div key={k}>
                <SmallCaps style={{ color: gold }}>{k}</SmallCaps>
                <div style={{ fontFamily: display, fontSize: 22, marginTop: 6, lineHeight: 1.2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Welcome paragraph + sermon */}
      <div style={{ maxWidth: maxW, margin: '0 auto', padding: '110px 40px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 72, alignItems: 'start' }}>
          <div>
            <SmallCaps style={{ color: muted }}>A Word from the Church</SmallCaps>
            <div style={{ fontFamily: display, fontSize: 54, color: ink, lineHeight: 1.02, marginTop: 18, letterSpacing: '-0.01em' }}>
              A small fellowship, gathered around a great Savior.
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 24 }}>
              <div style={{ width: 36, height: 1, background: gold }} />
              <SmallCaps style={{ color: gold }}>Since {new Date().getFullYear() - 40 /* placeholder */}</SmallCaps>
            </div>
            <p style={{ fontSize: 17, color: text, lineHeight: 1.7, marginTop: 30, textWrap: 'pretty' }}>
              Spanish Lookout EMMC is a Mennonite congregation in the Cayo District of Belize.
              Each Sunday morning we gather to sing, to pray, and to open the scriptures together.
              Whether you live up the road or are passing through, we would love to welcome you.
            </p>
            <a href="#" style={{
              display: 'inline-block', marginTop: 22,
              fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: ink, textDecoration: 'none',
              borderBottom: `1px solid ${ink}`,
              paddingBottom: 3, fontFamily: 'Inter, sans-serif', fontWeight: 500,
            }}>Plan your visit →</a>
          </div>

          <div>
            <SmallCaps style={{ color: muted }}>Latest Sermon</SmallCaps>
            <div style={{ fontFamily: display, fontSize: 34, color: ink, marginTop: 6, lineHeight: 1.1 }}>He Is Risen Indeed</div>
            <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>Blaine Dueck · April 19, 2026 · Easter 2026 · 38 min</div>
            <div style={{ marginTop: 18 }}>
              <VideoPlaceholder title="He Is Risen Indeed — Easter 2026" subtitle="YouTube · latest sermon" accent={ink} bg="#12100c" />
            </div>
            <a href={CHURCH.youtube} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 14, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink, textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              <span style={{ borderBottom: `1px solid ${ink}` }}>Watch on YouTube →</span>
            </a>
          </div>
        </div>
      </div>

      {/* Recent sermon list */}
      <div style={{ maxWidth: maxW, margin: '72px auto 0', padding: '0 40px' }}>
        <SmallCaps style={{ color: muted }}>Recent messages</SmallCaps>
        <HairRule color={ink} opacity={0.22} style={{ marginTop: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 24 }}>
          {SERMONS.slice(1).map((s) => (
            <div key={s.title}>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: gold, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{s.series}</div>
              <div style={{ fontFamily: display, fontSize: 26, color: ink, marginTop: 8, lineHeight: 1.15, textWrap: 'pretty' }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: muted, marginTop: 6 }}>{s.speaker} · {s.date} · {s.duration}</div>
              <HairRule color={ink} opacity={0.16} style={{ marginTop: 18 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Photo quilt */}
      <div style={{ maxWidth: maxW, margin: '110px auto 0', padding: '0 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, height: 520 }}>
          <div style={{ backgroundImage: 'url(images/worship-band.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 16 }}>
            <div style={{ backgroundImage: 'url(images/blaine-preach2.png)', backgroundSize: 'cover', backgroundPosition: 'center 30%' }} />
            <div style={{ backgroundImage: 'url(images/church-exterior-dusk-palm-trees.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 60%' }} />
          </div>
        </div>
      </div>

      {/* Faith triptych */}
      <div style={{ maxWidth: maxW, margin: '110px auto 0', padding: '0 40px', textAlign: 'center' }}>
        <SmallCaps style={{ color: muted }}>Our mission</SmallCaps>
        <div style={{ fontFamily: display, fontSize: 56, color: ink, marginTop: 14, lineHeight: 1.05, letterSpacing: '-0.01em' }}>
          <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Encourage,</em> equip, and send.
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginTop: 22 }}>
          <div style={{ width: 40, height: 1, background: gold }} />
          <SmallCaps style={{ color: gold }}>Making disciples · Connecting churches</SmallCaps>
          <div style={{ width: 40, height: 1, background: gold }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48, marginTop: 64, textAlign: 'left' }}>
          {[
            { h: 'Encourage', b: 'Walking with one another through every ordinary and extraordinary season of life.', v: 'Hebrews 10:24' },
            { h: 'Equip', b: 'Opening the scriptures week by week so each believer may grow into maturity in Christ.', v: '2 Timothy 3:16' },
            { h: 'Send', b: 'Joining God’s mission in Belize and beyond, in word and in quiet faithful service.', v: 'Matthew 28:19' },
          ].map((c, i) => (
            <div key={c.h}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, fontWeight: 500 }}>No. 0{i + 1}</div>
              <div style={{ fontFamily: display, fontSize: 34, color: ink, marginTop: 12, fontStyle: 'italic', fontWeight: 400 }}>{c.h}.</div>
              <HairRule color={ink} opacity={0.22} style={{ margin: '14px 0' }} />
              <div style={{ fontSize: 15, color: text, lineHeight: 1.65 }}>{c.b}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 12, fontStyle: 'italic' }}>{c.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* News strip */}
      <div style={{ marginTop: 120, background: ink, color: '#f3ead2' }}>
        <div style={{ maxWidth: maxW, margin: '0 auto', padding: '32px 40px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 32, alignItems: 'center' }}>
          <SmallCaps style={{ color: gold }}>From the church</SmallCaps>
          <div style={{ fontFamily: display, fontSize: 24, lineHeight: 1.25 }}>
            {NEWS[0].title}
            <span style={{ marginLeft: 14, fontSize: 13, opacity: 0.7, fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em' }}>{NEWS[0].date}</span>
          </div>
          <a href="#" style={{ color: gold, textDecoration: 'none', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', fontWeight: 500, borderBottom: `1px solid ${gold}` }}>All news →</a>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '96px 40px 40px' }}>
        <div style={{ maxWidth: maxW, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 56 }}>
          <div>
            <Logo height={30} />
            <div style={{ fontFamily: display, fontSize: 22, color: ink, marginTop: 18, lineHeight: 1.2 }}>Spanish Lookout EMMC</div>
            <div style={{ fontSize: 13, color: muted, marginTop: 10, maxWidth: 300 }}>A Mennonite congregation in Spanish Lookout, Cayo District, Belize. Part of the Evangelical Mennonite Mission Conference.</div>
          </div>
          <div>
            <SmallCaps style={{ color: muted }}>Visit</SmallCaps>
            <div style={{ fontFamily: display, fontSize: 20, color: ink, marginTop: 10, lineHeight: 1.25 }}>Spanish Lookout<br/>Cayo, Belize</div>
          </div>
          <div>
            <SmallCaps style={{ color: muted }}>Gather</SmallCaps>
            <div style={{ fontFamily: display, fontSize: 20, color: ink, marginTop: 10 }}>Sundays · 10 AM</div>
          </div>
          <div>
            <SmallCaps style={{ color: muted }}>Contact</SmallCaps>
            <div style={{ fontSize: 14, color: text, marginTop: 10, lineHeight: 1.9 }}>{CHURCH.email}<br/>{CHURCH.phone}</div>
          </div>
        </div>
        <div style={{ maxWidth: maxW, margin: '48px auto 0', paddingTop: 20, borderTop: `1px solid ${ink}22`, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: muted }}>
          <span>© 2026 Spanish Lookout EMMC</span>
          <span>emmc.ca · Making disciples, connecting churches</span>
        </div>
      </footer>
    </div>
  );
}

window.VariantC = VariantC;

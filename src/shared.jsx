// Shared pieces used by all three homepage variants.

const CHURCH = {
  name: "Spanish Lookout EMMC",
  fullName: "Spanish Lookout Evangelical Mennonite Mission Conference",
  tagline: "Making Disciples · Connecting Churches",
  address: "Spanish Lookout, Cayo District, Belize",
  serviceDay: "Sunday",
  serviceTime: "10:00 AM",
  welcome: "Everyone is welcome.",
  pastor: "Blaine Dueck",
  email: "blaine@sl-emmc.bz",
  phone: "+501 000‑0000",
  youtube: "https://www.youtube.com/@SpanishLookoutEMMC",
  gmaps: "https://maps.google.com/?q=Spanish+Lookout+EMMC",
};

const SCRIPTURES = [
  { ref: "Psalm 100:4", text: "Enter his gates with thanksgiving, and his courts with praise." },
  { ref: "Matthew 11:28", text: "Come to me, all you who are weary and burdened, and I will give you rest." },
  { ref: "Hebrews 10:24–25", text: "Let us consider how we may spur one another on toward love and good deeds, not giving up meeting together…" },
  { ref: "Psalm 46:10", text: "Be still, and know that I am God." },
];

const NEWS = [
  { date: "April 20, 2026", title: "Easter Sunday service · 10 AM", kicker: "This week" },
  { date: "April 13, 2026", title: "Youth baptism · 7 new members welcomed" },
  { date: "April 6, 2026", title: "Spring potluck & fellowship lunch" },
];

const SERMONS = [
  { date: "Apr 19, 2026", title: "He Is Risen Indeed", speaker: "Blaine Dueck", series: "Easter 2026", duration: "38:14" },
  { date: "Apr 12, 2026", title: "The Road to the Cross", speaker: "Blaine Dueck", series: "Passion Week", duration: "41:02" },
  { date: "Apr 5, 2026", title: "Palm Sunday · The King Arrives", speaker: "Blaine Dueck", series: "Passion Week", duration: "34:47" },
  { date: "Mar 29, 2026", title: "Living as Disciples", speaker: "Guest · J. Friesen", series: "Disciples", duration: "36:20" },
];

// ── Tiny presentational helpers ──────────────────────────────

function SmallCaps({ children, style }) {
  return (
    <span style={{
      textTransform: 'uppercase',
      letterSpacing: '0.18em',
      fontSize: 11,
      fontWeight: 500,
      ...style,
    }}>{children}</span>
  );
}

function HairRule({ color = 'currentColor', opacity = 0.25, style }) {
  return <div style={{ height: 1, background: color, opacity, ...style }} />;
}

// A subtly striped placeholder for an embedded video — used in the "sermon"
// sections where a real YouTube embed would otherwise sit.
function VideoPlaceholder({ title = "Latest sermon", subtitle = "YouTube embed", ratio = "16 / 9", accent = "#1f3a2e", bg = "#0f0e0c" }) {
  return (
    <div style={{
      position: 'relative',
      aspectRatio: ratio,
      width: '100%',
      background: bg,
      overflow: 'hidden',
      borderRadius: 2,
      backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 10px)`,
    }}>
      {/* play triangle */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          border: '1.5px solid rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 0, height: 0,
            borderTop: '11px solid transparent',
            borderBottom: '11px solid transparent',
            borderLeft: '17px solid rgba(255,255,255,0.85)',
            marginLeft: 4,
          }} />
        </div>
      </div>
      <div style={{
        position: 'absolute', left: 16, bottom: 14,
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{subtitle}</div>
        <div style={{ fontSize: 14, marginTop: 4, fontWeight: 500 }}>{title}</div>
      </div>
    </div>
  );
}

// Logo mark — uses the EMMC logo PNG; falls back to a typographic mark.
function Logo({ height = 28, color = "#1f3a2e", style, mono = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <img
        src="images/emmc-logo.png"
        alt="EMMC"
        style={{ height, width: 'auto', display: 'block',
          filter: mono ? 'grayscale(1) brightness(0.4)' : 'none',
          opacity: mono ? 0.9 : 1 }}
      />
    </div>
  );
}

Object.assign(window, {
  CHURCH, SCRIPTURES, NEWS, SERMONS,
  SmallCaps, HairRule, VideoPlaceholder, Logo,
});

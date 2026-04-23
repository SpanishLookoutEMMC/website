// App — lays out the three homepage variants on the design canvas,
// then wires Tweaks so the user can try different palettes and fonts
// across ALL three at once.

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "forest",
  "typePair": "cormorant-inter",
  "hero": "worship"
}/*EDITMODE-END*/;

const PALETTES = {
  forest: { a: { ink: '#1f3a2e', cream: '#f5f0e6' }, b: { ink: '#1f3a2e', cream: '#faf7f1' }, c: { ink: '#263a2b', cream: '#f5efdf', gold: '#a88a4a' } },
  navy:   { a: { ink: '#1a2942', cream: '#f4efe4' }, b: { ink: '#1a2942', cream: '#faf7f1' }, c: { ink: '#1a2942', cream: '#f4efe4', gold: '#a88a4a' } },
  oxblood:{ a: { ink: '#4a1e22', cream: '#f5ece0' }, b: { ink: '#4a1e22', cream: '#faf4e9' }, c: { ink: '#4a1e22', cream: '#f5ece0', gold: '#a88a4a' } },
  charcoal:{ a: { ink: '#2a2a28', cream: '#f2efe8' }, b: { ink: '#2a2a28', cream: '#faf7f1' }, c: { ink: '#2a2a28', cream: '#f2efe8', gold: '#8f7740' } },
};

const TYPE_PAIRS = {
  'cormorant-inter': { display: 'Cormorant Garamond', body: 'Inter' },
  'ebgaramond-lora': { display: 'EB Garamond', body: 'Lora' },
  'ebgaramond-inter': { display: 'EB Garamond', body: 'Inter' },
  'cormorant-lora':  { display: 'Cormorant Garamond', body: 'Lora' },
};

function App() {
  const [tweaks, setTweak] = useTweaks(DEFAULTS);
  const palette = PALETTES[tweaks.palette] || PALETTES.forest;
  const tpair = TYPE_PAIRS[tweaks.typePair] || TYPE_PAIRS['cormorant-inter'];

  const ta = { ...palette.a, ...tpair };
  const tb = { ...palette.b, ...tpair };
  const tc = { ...palette.c, ...tpair };

  // Artboards are fixed-width design frames; we render at 1280 desktop wide
  // and let the canvas host handle pan/zoom. Let intrinsic height grow.
  const W = 1280;

  return (
    <>
      <DesignCanvas>
        <DCSection id="hp" title="Homepage — 3 directions" subtitle="Same content · quiet classical book · three distinct moods. Pan & zoom; click any ↗ to fullscreen.">
          <DCArtboard id="a" label="A · Parish bulletin" width={W} height={2400}>
            <VariantA tweaks={ta} />
          </DCArtboard>
          <DCArtboard id="b" label="B · Quiet & typographic" width={W} height={2400}>
            <VariantB tweaks={tb} />
          </DCArtboard>
          <DCArtboard id="c" label="C · Scripture-forward (photo-driven)" width={W} height={2700}>
            <VariantC tweaks={tc} />
          </DCArtboard>
        </DCSection>

        <DCSection id="about" title="Notes & next steps" subtitle="">
          <DCArtboard id="notes" label="Reading guide" width={720} height={900}>
            <ReadingNotes />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Palette">
          <TweakRadio
            value={tweaks.palette}
            onChange={(v) => setTweak('palette', v)}
            options={[
              { value: 'forest', label: 'Forest green' },
              { value: 'navy', label: 'Deep navy' },
              { value: 'oxblood', label: 'Oxblood' },
              { value: 'charcoal', label: 'Warm charcoal' },
            ]}
          />
        </TweakSection>
        <TweakSection title="Type pairing">
          <TweakRadio
            value={tweaks.typePair}
            onChange={(v) => setTweak('typePair', v)}
            options={[
              { value: 'cormorant-inter', label: 'Cormorant Garamond + Inter' },
              { value: 'ebgaramond-lora', label: 'EB Garamond + Lora' },
              { value: 'ebgaramond-inter', label: 'EB Garamond + Inter' },
              { value: 'cormorant-lora', label: 'Cormorant + Lora' },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function ReadingNotes() {
  const ink = '#1f3a2e';
  return (
    <div style={{ padding: '44px 44px', background: '#faf7f1', fontFamily: 'Inter, sans-serif', color: '#2a2520', height: '100%', fontSize: 14, lineHeight: 1.65 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: `${ink}aa` }}>Spanish Lookout EMMC</div>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, color: ink, marginTop: 6, lineHeight: 1.1 }}>Three homepages,<br/>one humble voice.</div>
      <div style={{ height: 1, background: `${ink}33`, margin: '20px 0' }} />
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${ink}aa` }}>A · Parish bulletin</div>
        <div style={{ marginTop: 4 }}>Editorial two-column feel. Masthead + news ticker, photo hero with quiet welcome, sermon list reads like an index.</div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${ink}aa` }}>B · Quiet & typographic</div>
        <div style={{ marginTop: 4 }}>All-white hero, Psalm 46:10 as display type. Most reserved. A confident page for a humble church.</div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${ink}aa` }}>C · Scripture-forward (photo-driven)</div>
        <div style={{ marginTop: 4 }}>Cinematic worship photo hero with Psalm 100:4, photo quilt, faith triptych. Warmest and most visual.</div>
      </div>
      <div style={{ height: 1, background: `${ink}33`, margin: '20px 0' }} />
      <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${ink}aa` }}>Try the Tweaks panel</div>
      <div style={{ marginTop: 6 }}>Toggle it from the toolbar — swap palette (forest / navy / oxblood / charcoal) and type pairing. Changes apply to all three variants at once so you can compare apples to apples.</div>
      <div style={{ height: 1, background: `${ink}33`, margin: '20px 0' }} />
      <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${ink}aa` }}>Next steps</div>
      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
        <li>Pick one direction (or mix).</li>
        <li>Build out inner pages: Sermons, Statement of Faith, Team, News index, Contact.</li>
        <li>Wire real YouTube embed + markdown-powered news.</li>
        <li>Swap the placeholder contact info once Blaine confirms.</li>
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

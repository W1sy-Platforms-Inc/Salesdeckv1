/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSlider, TweakText */
// AIR-slide tweaks: device imagery (real photos vs icons), photo shape, network
// speed, and a per-device photo URL override so the user can drop in their own
// real product shots (Ray-Ban Meta, their exact cooler-cam / IoT sensor, etc.).

const AIR_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "deviceImagery": "icons",
  "photoShape": "rounded",
  "networkSpeed": 1,
  "photoPhone": "",
  "photoTablet": "",
  "photoGlasses": "",
  "photoIot": "",
  "photoCooler": ""
}/*EDITMODE-END*/;

const PHOTO_KEYS = {
  phone: 'photoPhone', tablet: 'photoTablet', glasses: 'photoGlasses',
  iot: 'photoIot', cooler: 'photoCooler',
};

function applyAirTweaks(t) {
  document.querySelectorAll('.s-air').forEach((el) => {
    el.setAttribute('data-air-media', t.deviceImagery);
    el.style.setProperty('--air-speed', String(t.networkSpeed));
    el.style.setProperty('--air-photo-radius', t.photoShape === 'circle' ? '50%' : '16px');
  });
  // Per-device photo override (only when a URL is provided; else keep markup default).
  document.querySelectorAll('.s-air__devPhoto').forEach((img) => {
    const key = PHOTO_KEYS[img.getAttribute('data-dev')];
    const url = key && t[key];
    if (url) {
      if (!img.dataset.default) img.dataset.default = img.getAttribute('src');
      if (img.getAttribute('src') !== url) img.setAttribute('src', url);
    } else if (img.dataset.default && img.getAttribute('src') !== img.dataset.default) {
      img.setAttribute('src', img.dataset.default);
    }
  });
  // SMIL traveling pulses use a fixed dur attribute — scale it to match the slider.
  document.querySelectorAll('.s-air__hub animateMotion').forEach((am) => {
    am.setAttribute('dur', (1.8 / t.networkSpeed).toFixed(2) + 's');
  });
}

function AirTweaksApp() {
  const [t, setTweak] = useTweaks(AIR_TWEAK_DEFAULTS);
  React.useEffect(() => { applyAirTweaks(t); }, [t]);
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="AIR capture layer" />
      <TweakRadio
        label="Device imagery"
        value={t.deviceImagery}
        options={[{ value: 'photos', label: 'Photos' }, { value: 'icons', label: 'Icons' }]}
        onChange={(v) => setTweak('deviceImagery', v)} />
      <TweakRadio
        label="Photo shape"
        value={t.photoShape}
        options={[{ value: 'rounded', label: 'Rounded' }, { value: 'circle', label: 'Circle' }]}
        onChange={(v) => setTweak('photoShape', v)} />
      <TweakSlider
        label="Network speed"
        value={t.networkSpeed} min={0.5} max={2} step={0.1} unit="×"
        onChange={(v) => setTweak('networkSpeed', v)} />

      <TweakSection label="Swap a device photo (paste URL)" />
      <TweakText label="Phone" value={t.photoPhone} placeholder="Android phone…"
        onChange={(v) => setTweak('photoPhone', v)} />
      <TweakText label="Tablet" value={t.photoTablet} placeholder="Tablet…"
        onChange={(v) => setTweak('photoTablet', v)} />
      <TweakText label="Meta Glasses" value={t.photoGlasses} placeholder="Smart glasses…"
        onChange={(v) => setTweak('photoGlasses', v)} />
      <TweakText label="IoT sensor" value={t.photoIot} placeholder="Shelf sensor…"
        onChange={(v) => setTweak('photoIot', v)} />
      <TweakText label="Cooler camera" value={t.photoCooler} placeholder="Cooler camera…"
        onChange={(v) => setTweak('photoCooler', v)} />
    </TweaksPanel>
  );
}

// Apply defaults to the live DOM immediately, before the panel is ever opened.
applyAirTweaks(AIR_TWEAK_DEFAULTS);

// Replay the staggered device-card entrance whenever the AIR slide activates.
// deck-stage suspends animations on inactive slides, so a slide reached via
// jump/thumbnail can land with its entrance queued-but-unstarted — re-trigger it.
(function airEntranceReplay() {
  const air = document.querySelector('.s-air');
  if (!air) return;
  const section = air.closest('[data-deck-slide]') || air.closest('section');
  if (!section) return;
  const replay = () => {
    if (!section.hasAttribute('data-deck-active')) return;
    air.querySelectorAll('.s-air__dev').forEach((d) => {
      d.style.animation = 'none';
      void d.offsetWidth;
      d.style.animation = '';
    });
  };
  new MutationObserver(replay).observe(section, { attributes: true, attributeFilter: ['data-deck-active'] });
  if (section.hasAttribute('data-deck-active')) replay();
})();

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<AirTweaksApp />);

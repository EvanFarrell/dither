export function setupHeroExport(getSelection, download) {
  const dialog = document.querySelector('#hero-dialog');
  const form = document.querySelector('#hero-form');
  const summary = document.querySelector('#hero-summary');
  const status = document.querySelector('#hero-status');
  const submit = document.querySelector('#hero-submit');

  document.querySelector('#hero-open').onclick = () => {
    if (!submit.disabled) {
      const {label, paletteLabel, duration} = getSelection();
      summary.textContent = `${label} · ${paletteLabel} · ${duration}s loop`;
      status.textContent = '';
    }
    dialog.showModal();
  };
  document.querySelector('#hero-close').onclick = () => dialog.close();

  form.onsubmit = async event => {
    event.preventDefault();
    if (submit.disabled) return;
    const fields = new FormData(form);
    const {scene, palette} = getSelection();
    const width = Number(fields.get('width'));
    const height = Number(fields.get('height'));
    const fps = Number(fields.get('fps'));
    const pixelSize = Number(fields.get('pixelSize'));
    if (width % pixelSize || height % pixelSize) {
      status.textContent = 'Width and height must be divisible by the dither cell size.';
      return;
    }

    submit.disabled = true;
    status.textContent = 'Encoding the hero pack…';
    try {
      const response = await fetch('/api/hero-export', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({scene, palette, width, height, fps, pixelSize}),
      });
      const contentType = response.headers.get('Content-Type') ?? '';
      if (!response.ok || !contentType.includes('application/zip')) {
        const message = contentType.includes('application/json') ? (await response.json()).error : null;
        throw new Error(message || 'Open Dither with npm run dev or npm run preview to export a hero pack.');
      }
      download(await response.blob(), `${scene}-${palette}-hero.zip`);
      status.textContent = 'Hero pack downloaded.';
    } catch (error) {
      status.textContent = error.message || 'Could not export the hero pack.';
    } finally {
      submit.disabled = false;
    }
  };
}

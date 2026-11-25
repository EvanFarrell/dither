import {renderField} from './render.js';

const labels = {
  blackhole: 'Black hole',
  godrays: 'God rays',
  sunslice: 'Sun slice',
  oceanworld: 'Ocean world',
  dreamfield: 'Dream field',
};

export function sceneLabel(name) {
  return labels[name] ?? name[0].toUpperCase() + name.slice(1);
}

export function createScenePicker(list, scenes, palettes, onSelect) {
  const groups = new Map();
  const buttons = [];
  const thumbnails = new Map();
  const observer = new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting) continue;
      const scene = thumbnails.get(target);
      observer.unobserve(target);
      thumbnails.delete(target);
      const context = target.getContext('2d');
      const image = context.createImageData(target.width, target.height);
      renderField(image, palettes[scene.pal], scene.fn, 2.5);
      context.putImageData(image, 0, 0);
    }
  }, {root: list});

  for (const [index, scene] of scenes.entries()) {
    if (!groups.has(scene.cat)) {
      const group = document.createElement('section');
      group.className = 'scene-group';
      const heading = document.createElement('h3');
      heading.textContent = sceneLabel(scene.cat);
      group.append(heading);
      groups.set(scene.cat, group);
      list.append(group);
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'scene-button';
    button.dataset.sceneIndex = index;
    button.addEventListener('click', () => onSelect(index));

    const thumbnail = document.createElement('canvas');
    thumbnail.className = 'scene-thumb';
    thumbnail.width = 80;
    thumbnail.height = 45;
    thumbnail.style.backgroundColor = 'rgb(' + palettes[scene.pal][0].join(',') + ')';
    thumbnail.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span');
    name.textContent = scene.label ?? sceneLabel(scene.name);
    button.append(thumbnail, name);
    groups.get(scene.cat).append(button);
    buttons.push(button);

    thumbnails.set(thumbnail, scene);
    observer.observe(thumbnail);
  }

  list.addEventListener('keydown', event => {
    const button = event.target.closest('.scene-button');
    const direction = {ArrowDown: 1, ArrowUp: -1, ArrowRight: 1, ArrowLeft: -1}[event.key];
    if (!button || !direction || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const next = (Number(button.dataset.sceneIndex) + direction + scenes.length) % scenes.length;
    onSelect(next);
    buttons[next].focus({preventScroll: true});
  });

  let current = null;
  return index => {
    if (buttons[index] === current) return;
    const initialSelection = current === null;
    current?.removeAttribute('aria-current');
    current = buttons[index];
    current.setAttribute('aria-current', 'true');
    const listBounds = list.getBoundingClientRect();
    const buttonBounds = current.getBoundingClientRect();
    const above = buttonBounds.top < listBounds.top;
    const below = buttonBounds.bottom > listBounds.bottom;
    if (initialSelection && (above || below)) {
      list.scrollTop += buttonBounds.top - listBounds.top - (listBounds.height - buttonBounds.height) / 2;
    } else if (below) {
      list.scrollTop += buttonBounds.bottom - listBounds.bottom + 6;
    } else if (above) {
      list.scrollTop += buttonBounds.top - listBounds.top - 6;
    }
  };
}

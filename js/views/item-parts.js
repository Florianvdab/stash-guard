import { element } from './dom.js';

export function itemIcon(item) {
  if (!item.icon) return element('div', { className: 'icon icon--missing', textContent: '?' });
  return element('img', { className: 'icon', src: `icons/${item.icon}.png`, alt: '', loading: 'lazy' });
}

export function itemName(item) {
  return element('span', { className: 'item-name', textContent: item.name });
}

export function itemDetails(item) {
  const details = item.set ? `${item.type} · ${item.set}` : item.type;
  return element('span', { className: 'item-details', textContent: details });
}

export function itemKind(item) {
  return element('span', { className: 'item-kind', textContent: item.type.replace(/^(Legendary|Set) /, '') });
}

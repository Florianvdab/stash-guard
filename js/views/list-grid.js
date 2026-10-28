import { element } from './dom.js';
import { itemIcon, itemKind, itemName } from './item-parts.js';

export function renderListGrid(container, items, { onRemove }) {
  container.replaceChildren(...items.map((item) => tile(item, onRemove)));
}

function tile(item, onRemove) {
  const caption = element('div', { className: 'tile__caption' }, [itemName(item), itemKind(item)]);
  const node = element('li', { className: `tile quality-${item.quality}`, title: item.set ?? item.type }, [
    itemIcon(item),
    caption,
    removeButton(item, onRemove),
  ]);
  node.style.setProperty('view-transition-name', `tile-${item.id.replace(/[^\w-]/g, '_')}`);
  return node;
}

function removeButton(item, onRemove) {
  return element('button', {
    type: 'button',
    className: 'tile__remove',
    ariaLabel: `Remove ${item.name}`,
    textContent: '×',
    onclick: () => onRemove(item),
  });
}

import { element } from './dom.js';
import { itemDetails, itemIcon, itemName } from './item-parts.js';

export function renderSearchResults(container, results, { activeIndex, isOnList }) {
  container.replaceChildren(
    ...results.map((item, index) => resultRow(item, index, { active: index === activeIndex, onList: isOnList(item) })),
  );
}

export function resultId(index) {
  return `result-${index}`;
}

function resultRow(item, index, { active, onList }) {
  const label = element('div', { className: 'result__label' }, [itemName(item), itemDetails(item)]);
  return element(
    'li',
    {
      id: resultId(index),
      className: `result quality-${item.quality}`,
      attributes: { role: 'option', 'aria-selected': active, 'data-index': index },
    },
    [itemIcon(item), label, marker(onList)],
  );
}

function marker(onList) {
  return element('span', {
    className: onList ? 'marker marker--on-list' : 'marker',
    textContent: onList ? '✓ On list' : '+ Add',
  });
}

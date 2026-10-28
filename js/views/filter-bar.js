export function renderFilterBar(container, { active, counts }) {
  for (const button of container.querySelectorAll('[data-filter]')) {
    const filter = button.dataset.filter;
    button.setAttribute('aria-pressed', String(filter === active));
    button.querySelector('.count').textContent = counts[filter];
  }
}

export function onFilterClick(container, handler) {
  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (button) handler(button.dataset.filter);
  });
}

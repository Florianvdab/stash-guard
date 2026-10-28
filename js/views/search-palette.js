import { wrapIndex } from '../selection.js';
import { renderSearchResults, resultId } from './search-results.js';

const ARROW_STEPS = { ArrowDown: 1, ArrowUp: -1 };

// A command-palette style search: opens on demand, keyboard first, stays open while adding.
export class SearchPalette {
  #elements;
  #actions;
  #results = [];
  #activeIndex = 0;

  constructor(elements, actions) {
    this.#elements = elements;
    this.#actions = actions;
    this.#bindEvents();
  }

  open(text = '') {
    const { dialog, input } = this.#elements;
    input.value = text;
    if (!dialog.open) dialog.showModal();
    input.focus();
    this.#search();
  }

  refresh() {
    const { input, results } = this.#elements;
    renderSearchResults(results, this.#results, { activeIndex: this.#activeIndex, isOnList: this.#actions.isOnList });
    input.setAttribute('aria-activedescendant', this.#results.length ? resultId(this.#activeIndex) : '');
    results.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
    this.#renderHint();
  }

  #bindEvents() {
    const { dialog, input, results } = this.#elements;
    input.addEventListener('input', () => this.#search());
    input.addEventListener('keydown', (event) => this.#onKeyDown(event));
    results.addEventListener('click', (event) => this.#onResultClick(event));
    dialog.addEventListener('click', (event) => event.target === dialog && dialog.close());
    dialog.addEventListener('close', () => input.blur()); // otherwise focus stays in the closed dialog
    dialog.querySelector('[data-close-palette]').addEventListener('click', () => dialog.close());
  }

  #search() {
    this.#results = this.#actions.search(this.#elements.input.value);
    this.#activeIndex = 0;
    this.refresh();
  }

  #onKeyDown(event) {
    if (event.key in ARROW_STEPS) {
      event.preventDefault();
      this.#activeIndex = wrapIndex(this.#activeIndex + ARROW_STEPS[event.key], this.#results.length);
      this.refresh();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.#toggle(this.#activeIndex);
    }
  }

  #onResultClick(event) {
    const row = event.target.closest('[data-index]');
    if (!row) return;
    this.#activeIndex = Number(row.dataset.index);
    this.#toggle(this.#activeIndex);
  }

  #toggle(index) {
    const item = this.#results[index];
    if (item) this.#actions.onToggle(item);
  }

  #renderHint() {
    const query = this.#elements.input.value.trim();
    const { hint } = this.#elements;
    hint.hidden = this.#results.length > 0;
    hint.textContent = query ? `Nothing found for “${query}”.` : 'Search by item or set name.';
  }
}

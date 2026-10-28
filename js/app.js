import { parseBackup, toBackup } from './backup.js';
import { createCatalog } from './catalog.js';
import { downloadFile } from './files.js';
import { contains, merge, reconcile, remove, resolve, toggle } from './my-list.js';
import { ALL, countByQuality, hasQuality } from './quality.js';
import { onSearchShortcut } from './shortcuts.js';
import { loadList, saveList } from './storage.js';
import { startEmbers } from './views/embers.js';
import { onFilterClick, renderFilterBar } from './views/filter-bar.js';
import { renderListGrid } from './views/list-grid.js';
import { SearchPalette } from './views/search-palette.js';
import { createStatus } from './views/status.js';
import { withViewTransition } from './views/transition.js';

const byId = (id) => document.getElementById(id);
const page = {
  summary: byId('summary'),
  filters: byId('filters'),
  grid: byId('my-list'),
  empty: byId('empty'),
  emptyTitle: byId('empty-title'),
  exportButton: byId('export'),
  importInput: byId('import'),
};
const showStatus = createStatus(byId('status'));
const state = { catalog: createCatalog([]), list: [], filter: ALL };
const palette = new SearchPalette(
  { dialog: byId('palette'), input: byId('search'), results: byId('results'), hint: byId('palette-hint') },
  {
    search: (query) => state.catalog.search(query),
    isOnList: (item) => contains(state.list, item),
    onToggle: (item) => updateList(toggle(state.list, item)),
  },
);

bindEvents();
startEmbers(byId('embers'));
start();

async function start() {
  try {
    state.catalog = createCatalog(await loadItems());
    state.list = reconcile(loadList(), state.catalog.find);
    withViewTransition(render);
  } catch {
    showStatus("Couldn't load the item data. Reload the page to try again.");
  }
}

async function loadItems() {
  const response = await fetch('data/items.json');
  if (!response.ok) throw new Error(`items.json: ${response.status}`);
  return (await response.json()).items;
}

function bindEvents() {
  for (const button of document.querySelectorAll('[data-open-search]')) {
    button.addEventListener('click', () => palette.open());
  }
  onSearchShortcut((text) => palette.open(text));
  onFilterClick(page.filters, (filter) => {
    state.filter = filter;
    withViewTransition(renderList);
  });
  page.exportButton.addEventListener('click', () => downloadFile(toBackup(state.list)));
  page.importInput.addEventListener('change', () => importBackup(page.importInput.files[0]));
}

async function importBackup(file) {
  try {
    const incoming = reconcile(parseBackup(await file.text()), state.catalog.find);
    const merged = merge(state.list, incoming);
    showStatus(`Imported ${merged.length - state.list.length} new items.`);
    updateList(merged);
  } catch (error) {
    showStatus(error.message);
  }
  page.importInput.value = '';
}

function updateList(list) {
  state.list = list;
  if (!saveList(list)) showStatus("Your browser blocks storage, so this list won't survive a reload. Export it to keep it.");
  withViewTransition(render);
}

function render() {
  palette.refresh();
  renderList();
}

function renderList() {
  const items = resolve(state.list, state.catalog.find);
  const visible = items.filter(hasQuality(state.filter)).sort((a, b) => a.name.localeCompare(b.name));

  renderFilterBar(page.filters, { active: state.filter, counts: countByQuality(items) });
  renderListGrid(page.grid, visible, { onRemove: (item) => updateList(remove(state.list, item)) });
  renderEmptyState(items.length, visible.length);
}

function renderEmptyState(total, visible) {
  page.summary.textContent = `${total} ${total === 1 ? 'item' : 'items'} on watch`;
  page.empty.hidden = visible > 0;
  page.filters.hidden = total === 0;
  page.emptyTitle.textContent = total ? 'Nothing of this kind on your list.' : 'Your stash is unguarded.';
}

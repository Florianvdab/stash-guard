import { sanitize } from './my-list.js';

const KEY = 'stash-guard:list';

// Storage can be blocked (private windows, strict settings), so failures never break the page.

export function loadList() {
  try {
    return sanitize(JSON.parse(localStorage.getItem(KEY)));
  } catch {
    return [];
  }
}

export function saveList(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

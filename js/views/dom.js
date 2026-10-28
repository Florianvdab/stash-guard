export function element(tag, properties = {}, children = []) {
  const { attributes = {}, ...rest } = properties;
  const node = Object.assign(document.createElement(tag), rest);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  node.append(...children);
  return node;
}

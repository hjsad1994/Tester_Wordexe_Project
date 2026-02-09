const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const truncate = (text, length = 100) => {
  if (!text || text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
};

const generateId = (prefix = 'id') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
};

const toCamelCase = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
};

module.exports = {
  slugify,
  capitalize,
  truncate,
  generateId,
  toCamelCase,
};

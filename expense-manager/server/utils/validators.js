/**
 * Validadores para inputs de la API
 */

/**
 * Valida que un monto sea un número positivo
 * @param {number} amount - El monto a validar
 * @returns {boolean} - True si es válido
 */
function isValidAmount(amount) {
  return typeof amount === 'number' && amount > 0 && isFinite(amount);
}

/**
 * Valida que una descripción no esté vacía
 * @param {string} description - La descripción a validar
 * @returns {boolean} - True si es válida
 */
function isValidDescription(description) {
  return typeof description === 'string' && description.trim().length > 0 && description.trim().length <= 255;
}

/**
 * Valida que una fecha sea válida
 * @param {string} dateStr - La fecha en formato YYYY-MM-DD
 * @returns {boolean} - True si es válida
 */
function isValidDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
}

/**
 * Valida que un ID sea un entero positivo
 * @param {number|string} id - El ID a validar
 * @returns {boolean} - True si es válido
 */
function isValidId(id) {
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0;
}

/**
 * Sanitiza un string para prevenir XSS básico
 * @param {string} str - El string a sanitizar
 * @returns {string} - El string sanitizado
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

module.exports = {
  isValidAmount,
  isValidDescription,
  isValidDate,
  isValidId,
  sanitizeString
};

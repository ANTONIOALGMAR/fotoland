/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/**
 * If you need to support Internet Explorer, add the following to your project:
 * import 'core-js/es/array';
 * import 'core-js/es/date';
 * import 'core-js/es/function';
 * import 'core-js/es/map';
 * import 'core-js/es/math';
 * import 'core-js/es/number';
 * import 'core-js/es/object';
 * import 'core-js/es/promise';
 * import 'core-js/es/reflect';
 * import 'core-js/es/regexp';
 * import 'core-js/es/set';
 * import 'core-js/es/string';
 * import 'core-js/es/symbol';
 * import 'core-js/es/weak-map';
 * import 'core-js/es/array';
 * import 'core-js/es/object';
 * import 'core-js/es/function';
 * import 'core-js/es/parse-int';
 * import 'core-js/es/parse-float';
 * import 'core-js/es/number';
 * import 'core-js/es/math';
 * import 'core-js/es/string';
 * import 'core-js/es/date';
 * import 'core-js/es/regexp';
 * import 'core-js/es/map';
 * import 'core-js/es/weak-map';
 * import 'core-js/es/set';
 */

/***************************************************************************************************
 * Zone JS is required by Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.


/***************************************************************************************************
 * APPLICATION IMPORTS
 */

// Definir 'global' para navegadores que não o possuem (polyfill para libs que esperam Node.js)
(function () {
  const w = window as any;
  if (typeof w.global === 'undefined') {
    w.global = w;
  }
})();

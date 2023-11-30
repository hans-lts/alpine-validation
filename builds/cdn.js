import ComponentErrors from '../src/index.js';

document.addEventListener('alpine:init', () => {
    ComponentErrors(window.Alpine);
});
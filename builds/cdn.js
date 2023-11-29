import { localValidation, globalValidation } from '../src/index.js';

document.addEventListener('alpine:init', () => {
    localValidation(window.Alpine);
    globalValidation(window.Alpine);
});
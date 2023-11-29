function bindComponent(el, Alpine) {
    Alpine.bind(el, {
        'x-data'() {
            return {
                __component: 'localValidation',
                errors: [],
                models: [],
                processValidation(errors) {
                    this.errors = errors;
                    this.models = Object.keys(errors);
                },
                errorsFor(model) {
                    if(model.includes('*')) {
                        let models = this.wildcardModelSearch(model);
                        let errors = [];

                        for(let result of models) {
                            errors.push(...this.errors[result])
                        }
                        return errors;
                    }
                    return this.errors[model] ?? [];
                },
                hasErrors(model) {
                    return this.errorsFor(model).length > 0 ?? false;
                },
                wildcardModelSearch(term) {
                    let rx = new RegExp(term.replaceAll('*', '.*'))
                    return this.models.filter(model => rx.test(model));
                }
            }
        }
    })
}

export default function (Alpine) {
    // Ensure the hook is loaded on every page
    document.addEventListener("DOMContentLoaded", () => {
        Livewire.hook('message.processed', (message, component) => {
            let alpineComponent = Alpine.$data(component.el);

            // Make sure we aren't going to call an invalid alpine component
            if(alpineComponent.__component === 'localValidation') {
                alpineComponent.processValidation(message.response.serverMemo.errors);
            }
        })
    });

    Alpine.directive('validation', (el, { modifiers }, { Alpine }) => {
        bindComponent(el, Alpine);
    }).before('bind')
}
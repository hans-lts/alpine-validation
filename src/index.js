export function bindComponent(el, Alpine) {
    Alpine.bind(el, {
        'x-data'() {
            return {
                errors: [],
                models: [],
                errorsFor(model) {                    
                    // Checking for any errors
                    if(!model) {
                        let errors = [];

                        for(let result of this.models) {
                            errors.push(...this.errors[result])
                        }                        
                        return errors;
                    }

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
                firstErrorFor(model) {                    
                    return this.errorsFor(model)[0]
                },
                hasErrors(model) {
                    return this.errorsFor(model).length > 0 ?? false;
                },
                processValidation(errors) {
                    this.errors = errors;
                    this.models = Object.keys(errors);
                },
                wildcardModelSearch(term) {
                    let rx = new RegExp(term.replaceAll('*', '.*'))
                    return this.models.filter(model => rx.test(model));
                }
            }
        }
    })
}

export function bindLivewireV2Hook() {
    Livewire.hook('message.processed', (message, component) => {
        let alpineComponent = Alpine.$data(component.el);

        // Make sure we aren't going to call an invalid alpine component
        if (alpineComponent.processValidation) {
            alpineComponent.processValidation(message.response.serverMemo.errors);
        }
    });
}

export function bindLivewireV3Hook() {
    Livewire.hook('commit', ({component, commit, respond, succeed, fail}) => {
        succeed(({snapshot, effect}) => {
            let alpineComponent = Alpine.$data(component.el);

            if (alpineComponent.processValidation) {
                alpineComponent.processValidation(JSON.parse(snapshot).memo.errors);
            }
        })
    });
}

export default function (Alpine) {
    (Livewire.components?.hooks !== undefined) ? 
        bindLivewireV2Hook() : 
        bindLivewireV3Hook();

    Alpine.directive('wire-errors', (el, { modifiers }, { Alpine }) => {
        bindComponent(el, Alpine);
    }).before('bind')

    
    // Gives the ability to check on another component's errors
    // which might be useful if one component's activity 
    // depends on the error state of another
    Alpine.magic('componentErrors', (el, { Alpine }) => (elementId, model) => {
        let element = document.getElementById(elementId);

        if(!element) {
            console.warn(`Element ${elementId} not found`)
            return [];
        }

        let stack = Alpine.$data(element);

        if(!stack || !stack.$root.id === elementId) {
            console.warn(`Element ${elementId} is not an AlpineJs component`)
            return [];
        }

        return stack.errorsFor(model);
    })
}
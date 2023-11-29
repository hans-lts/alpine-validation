function bindComponent(el, Alpine) {
    Alpine.bind(el, {
        'x-data'() {
            return {
                wireId: null,
                init() {
                    // Get the wire:id attribute - In cases where the Alpine component
                    // is not on the root of the Livewire element we will search
                    // for the closest one and track that
                    this.wireId = this.$el.__livewire.id ?? Alpine.findClosest(el, i => i.__livewire.id);
                },
                get errors() {
                    return this.$store.validationErrors.__errors[this.wireId] ?? []
                },
                get models() {
                    let errorList = [];

                    for(const model of this.$store.validationErrors.getWireModels(this.wireId)) {
                        errorList.push({
                            name: model,
                            errors: this.$store.validationErrors.getErrorMessages(this.wireId, model)
                        })
                    }
                    return errorList;
                },
                messages(model, wildcard) {
                    if(wildcard) {
                        let messages = [];
                        let modelPrefix = model.split('*')[0];
                        let models = this.models.filter(model => model.name.startsWith(modelPrefix))

                        for(const model of models) {
                            messages.push(...model.errors)
                        }

                        return messages;
                    }
                    return this.$store.validationErrors.getErrorMessages(this.wireId, model)
                }
            }
        }
    })
}

function initErrorStore(Alpine) {
    Alpine.store('validationErrors', {
        __errors: {},
        init() {
            console.info("Validation store initialized")
            // Hook the component message from the server after the DOM is finished updating
            Livewire.hook('message.processed', (message, component) => {
                this.__errors[message.component.id] = message.response.serverMemo.errors
            })
        },
        get components() {
            return Object.keys(this.__errors).filter(model => Object.values(this.__errors[model]).length > 0)
        },
        getWireModels(component) {
            return Object.keys(this.__errors[component] ?? [])
        },
        getErrorMessages(component, model) {
            if(!this.__errors[component]) {
                return []
            }
            return this.__errors[component][model] ?? []
        },
        hasValidationErrors(component, model) {
            return this.getErrorMessages(component, model).length > 0 ?? false
        }
    })

    return true
}

export default function (Alpine) {
    // Safely register the error store
    if(!initErrorStore(Alpine)) {
        console.warn("Reinitialization of error store")
    }

    Alpine.directive('share-validation', (el, { modifiers }, { Alpine }) => {
        bindComponent(el, Alpine)
    }).before('bind')

    Alpine.magic('errors', (el, { Alpine }) => model => {
        return Alpine.$data(el).messages(model, model.endsWith('*'));
    })

    Alpine.magic('hasError', (el, { Alpine }) => model => {
        let state = Alpine.$data(el).models.find(x => x.name === model);
        return state ? state.errors.length > 0 : false;
    })
}
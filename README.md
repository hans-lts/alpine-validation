## Premise

The purpose of this plugin is to make Livewire validation results easily accessible through AlpineJs.

## Installation

### CDN

Include the following `<script>` tag in the `<head>` of your application layout. The script tag must be added **before** the Alpine scripts.

```html
<script defer src="https://cdn.jsdelivr.net/npm/wire-validation@latest/dist/wire-validation.min.js"></script>
```

See [Alpine installation](https://alpinejs.dev/essentials/installation) instructions for more info.

### NPM

You can install the plugin from NPM with the following command:

```shell
npm install wire-validation
```

Then initialize it in your application along with any other Alpine plugins:

```js
import Alpine from 'alpinejs';
import ValidationErrors from 'wire-validation';

Alpine.plugin(ValidationErrors);

Alpine.start();
```

## Usage

There are two strategies that can be used to access and display the validation errors: either through a global error store or on a component-by-component basis.

Adding the `x-wire-errors` directive to the root element of your Livewire component will grant you access to your component's validation errors with the following helpers:

### Checking for any validation errors

You can check your component for validation errors by using the `hasErrors()` helper. This helper returns a `bool`. If no wire model name is passed to the helper, the component will be checked for ANY errors.

```html
<form id="my-livewire-component" x-data x-wire-errors>
    <label>
        <span>Name</span>
        <input type="text" wire:model="name" />
    </label>

    <!-- This will only show when some error exists on the component -->
    <div x-show="hasErrors()" class="error-text">
        There is some error on your form!
    </div>

    <button type="submit">Save</button>
</form>
```

When the form is submitted with an error, the message shows up! No need to mess around with any blade directives. What if you wanted to check for a specific error though? 

### Checking specific fields

`hasErrors()` also accepts a string parameter where you can specify the specific `wire:model` to check against:

```js 
hasErrors('some.model')
```

The error checking supports dot notation and wildcards as well!

#### Example

Using the same example from above, we will add another input field bound to the Livewire property `age`.

```html
<style>
    /* set a fat red border with red text */
    .form-error {
        border: 4px solid #FF0000;        
        color: #FF0000;
    } 
</style>

<form id="my-livewire-component" x-data x-wire-errors>
    <label>
        <span>Name</span>
        <input type="text" wire:model="name" :class="{'form-error': hasErrors('name')}" />
    </label>

    <label>
        <span>Age</span>
        <input type="text" wire:model="age" :class="{'form-error': hasErrors('age')}" />
    </label>

    <button type="submit">Save</button>
</form>
```

As you can see, we use Alpine's [class binding](https://alpinejs.dev/directives/bind#binding-classes) to add the `form-error` class when our input field has an error. The class will only be bound when an error for the specified `wire:model` is present.

This is all fine, but at some point you'll probably want to display the error message to the user.

### Displaying errors

To display the error messages using AlpineJs, you'll need to use the `errorsFor()` helper which returns an `array` of error strings. Like `hasErrors()`, this helper accepts an optional string parameter which can be used to select the errors from specific fields (wildcard support here too!). Calling `errorsFor()` with no parameter will return all errors for the component in an `array`.

#### Example

Continuing off the example from above, we can add error messages below the input fields. I'm going to scope in on just the `name` part of the form for sanity's sake.

```html
<label>
    <span>Name</span>
    <input type="text" wire:model="name" :class="{'form-error': hasErrors('name')}" />
    
    <!-- Loop through any error messages and display them -->
    <div x-for="(message, index) in errorsFor('name')" 
         :key="index" 
         class="form-error"
         x-text="message"
    ></div>    
</label>
```

We use the Alpine's [x-for directive](https://alpinejs.dev/directives/for) directive to loop through the error messages and display them. But what if you just want to show one error at a time?

### Displaying only the first error

We can use the `firstErrorFor()` helper which follows has all of the same features as the previous helpers (empty string, wildcard, filter by model...). This helper returns a `string` for the specified component or field.

#### Example

We can modify the example above to show only the first error for the `name` field

```html
<label>
    <span>Name</span>
    <input type="text" wire:model="name" :class="{'form-error': hasErrors('name')}" />
    
    <!-- Display only the first error -->
    <div x-show="hasErrors('name')" x-text="firstErrorFor('name')"></div>  
</label>
```

### Accessing other component's error state

If you wanted to reach over to another `x-wire-errors` Livewire component you can use the magic directive `$componentErrors(elementId, wireModel)`.

The first parameter is an HTML element id and the second optional parameter is the desired wire model filter (same rules apply - emtpy, wildcard, etc).

You can leverage this to quickly check on another component when your Livewire component depends on another's error state.

## License

Licensed under the MIT license, see [LICENSE](LICENSE) for details.

formMe
========

Dependencies

- jQuery (https://jquery.com/)
- validateMe (https://github.com/QuatreCentQuatre/validateMe)

## How to implement

First, you'll need to link jQuery and validateMe file in your project 
```html
<script type="text/javascript" src="/path/to/directory/node_modules/jquery/dist/jquery.js"></script>
<script type="text/javascript" src="/path/to/directory/node_modules/validate-me/dist/me-validate.min.js"></script>
<script type="text/javascript" src="/path/to/directory/node_modules/form-me/dist/me-forms.min.js"></script>
```
Here you go ! You're now ready to use formMe.

To create a form and to add validation to it, here's the things you need to do to make it work.

- Create your HTML form
- Create your Javascript view.

###HTML Form
You'll need to create an HTML form with a special attribute <b>me:form</b> with the form class name you'll create as value.

Example:
```html
<form method="post" action="#" ajax="true" me:form="BasicForm">
    <div>
        <input type="text" name="name" id="name" placeholder="name">
    </div>
    <div>
        <input type="text" name="email" id="email" placeholder="email">
    </div>
    <input type="submit">
</form>
```

Here's are the attribute to set on your form element.

- method : (Mandatory) POST or GET
- ajax : If added, need to be set to "true". If ajax not needed, just remove the attribute from the DOM
- action :  URL for the request

###Javascript view
You'll need to create a Javascript file with a class that extends the basic Form class from the me-form-base.js file.

In the construction, you'll have to set the fields you need to be validate. For all possible option in a single field, please refer to the field section.

Example:
```javascript
class BasicForm extends FormBase{
    constructor(options){
        super(options);
    
        this.fields = [
            {name:'name'},
            {name:'email', type: 'email'},
        ];
    }
}

Me.forms['BasicForm'] = BasicForm;
```

###Params
You can have default params set for your form view. The way to do it is to declare the defaults function and return the object of defaults value you want.

Example:
```javascript
class BasicForm extends FormBase{
    defaults(){
      return {
        'ajaxUrl':'/path/to/route'
      }   
    }
    constructor(options){
        super(options);
    
        this.fields = [
            {name:'name'},
            {name:'email', type: 'email'},
        ];
    }
}

Me.forms['BasicForm'] = BasicForm;
```

The defaults params can be changed in your DOM declaration.

Example:
```html
<form method="post" action="#" ajax="true" me:form="BasicForm" me:form:data='{"ajaxUrl":"/new/path/to/route"}'>
    <div>
        <input type="text" name="name" id="name" placeholder="name">
    </div>
    <div>
        <input type="text" name="email" id="email" placeholder="email">
    </div>
    <input type="submit">
</form>
```


###Submit Button
You can define a custom submit button by adding me:form:submit to the desired element. Otherwise, the submit type will bbe assigned as submit button


## Field Params

- name: (String) [Required] Name attribute of the field
- type: (String) [email, phone, zipcode]
- required: (Bool) If needs to be filled and validate
- copy: (String) Name of the field element to compare value with
- regex: (RegExp) RegExp to compare value with
- validation: (Function) Function to create custom validation. Need to return boolean.
- default_ok: (Boolean) If the default option of the select can be a valid option.
- file_size: (Number) Filesize allowed in kb
- file_type: (Array) Types allowed. Exemple: ['.png', '.jpg']
- error: (jQuery Element) Single element that will automatically show on error. See me-form-accessible-view.js in demo
- mask_option: (Object IMask Options) //See https://imask.js.org/

## Customization

### Validation
If you are looking to add a custom validation on one of the field, simply add the validation key to the field object with a function as value. 
The function will automatically receive a field params to access all field options.

```javascript
class BasicForm extends FormBase{
    constructor(options){
        super(options);
    
        this.fields = [
            {name:'name', validation: this.validateName},
        ];
    }

    validateName(field){
        let isValid = true;
        // Do your validation and change isValid if it's not the case

        return isValid;
    }
}

Me.forms['BasicForm'] = BasicForm;
```

## Functions
Here's a list of all function that can be modified.

###submitHandler(e)
Will be triggered by clickSubmitHandler and if the user submit by hitting enter. Will look if ajax is defined or not to trigger the right submit.

###onValidationSuccess(fields)
If no error found, it will go through this function to remover all invalid fields and errors and trigger the handleAjaxSend function. When calling handleAjaxSend, we need to format data to send it as param.

###onValidationError(fields, errorFields)
If error found during validation, it will pass here to show fields with error to the user.

###resetFieldState(field)
Handle what should happen to a field when it pass all validation.

###handleValidationErrorField(field)
Handle what should happen to a field when there's an error

###handleAjaxSend(formData)
This function will handle the definition of the ajax call that will execute soon after. The param formData, is the data previously formatted in the onValidationSuccess function.

###ajaxSuccess(data)
As the function name says it, when the call return a success, it goes here and we do our magic to show a success message.

###ajaxError(error)
As the function name says it, when the call return an error, it goes here and we do our magic to show a error message.

###reset()
This will reset fields to original empty value

###Modify functions
To extend or completely modify a function simple declare it in your new class like the following example. Use de super if you want the original code to run before the code you will add.
```javascript
class BasicForm extends FormBase{
    constructor(options){
        super(options);
    
        this.fields = [
            {name:'name'},
        ];
    }
    
    resetFieldState(field) {
        super.resetFieldState(field);
        //Custom code to run after field pass validation success
    }
}

Me.forms['BasicForm'] = BasicForm;
```

###Errors
Looking to handle error message for your fields? There is a simple way to handle them. Simply add the error attribute to the field object you want an error to show with the element you want to see when the error occur.

Add the element you want to show on error in your HTML
```html
<form method="post" action="#" ajax="true" me:form="BasicForm">
    <div>
        <input type="text" name="name" id="name-accessible" placeholder="name">
        <p class="error-message hide" id="name-error-message" aria-hidden="true" role="alert" aria-atomic="true">Please enter a name!</p>
    </div>
    <input type="submit">
</form>
```


```javascript
this.fields = [
    {name:'name', required: true, error: $('#name-error-message')}
];
```

If you're looking to handle multiple case for one field you need to do it by yourself. Here's a little trick to do so.
In the handleValidationErrorField function, you'll be able to detect the error code and use it to target a specific DOM element with this value in a specific attribute. The attribute name will depend on your DOM configuration.

```javascript
class BasicForm extends FormBase{
    constructor(options){
        super(options);
    
        this.fields = [
            {name:'email'},
        ];
    }
    
    resetFieldState(field) {
        super.resetFieldState(field);
        field.$el.siblings('.error-message').addClass('hide').attr('aria-hidden', true);
    }
    
    handleValidationErrorField(field) {
        super.handleValidationErrorField(field);
    
        if(field.error_code){
            field.$el.siblings('.error-message').addClass('hide').attr('aria-hidden', true);
            field.$el.siblings('.error-message[data-error-code="' + field.error_code + '"]').removeClass('hide').attr('aria-hidden', false);
        }
    };
}

Me.forms['BasicForm'] = BasicForm;
```

##Recaptcha v3

If you are loading Recaptcha v3 into your project, FormMe has an automatic detection to ensure recaptcha validation before ajax call.

###How does it work?

If you have set `ajax="true"` on your form and if `grecaptcha` is defined, FormMe will perform a recaptcha validation before the ajax call.

To perform that validation, FormMe will expect :
- a `window.SETTINGS.RECAPTCHA_KEY` containing the recaptcha site key to use
- a `recaptcha-action` attribute on your `<form>` containing the action to use
- a `<input type="hidden" name="g-recaptcha-response">` into the `<form>` to store the validation token

In case you have set `ajax="true"` on your form and `grecaptcha` is defined but you want to prevent FormMe to perform a recaptcha validation, you can add `recaptcha="false"` on your `<form>`
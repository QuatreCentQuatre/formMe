class ValidateMe {
    constructor(scope){
        this.form = scope;
        this.fields = [];
    }

    addField(options){
        let field = $.extend({}, this.baseFieldAttr, options);
        field.$el = this.form.$el.find('[name="'+field.name+'"]');

        if(!this.isValidOptions(field))
            return;

        field.id          = field.$el.attr('id') || null;
        field.placeholder = field.$el.attr('placeholder') || null;

        if (!field.type) {
            let tag = field.$el.prop("tagName").toLowerCase();
            field.type = (tag === "input") ? field.$el.prop("type").toLowerCase() : tag;

            if(field.type === 'select'){
                field.defaultValue = (field.$el.find('[default]').length > 0) ? field.$el.find('[default]') : field.$el.find('option').eq(0);
            }
        }


        field.$copy = (field.copy) ? this.form.$el.find('[name="' + field.copy + '"]') : null;
        field.regex = (!!field.regex) ? field.regex : (!!this.customFieldType[field.type]) ? this.customFieldType[field.type].regex : null;

        this.fields.push(field);
    }

    removeField(name){
        let field = this.getField(name);

        if(field){
            this.fields.splice(this.fields.indexOf(field), 1);
        }
    }

    getField(name){
        return this.fields.find((el) => {
            return el.name === name;
        })
    }

    validate(){
        this.invalidFields = [];

        for (let field of this.fields) {
            let fieldValid = (!!this.validations.default(field));

            if(fieldValid){
                if(!!this.validations[field.type]){
                    fieldValid = !!this.validations[field.type](field);

                    if(fieldValid && !!field.validation){
                        fieldValid = !!field.validation(field);
                    }
                }
            }

            if(!fieldValid){
                this.invalidFields.push(field);
            }
        }

        if(this.hasError){
            this.form.onValidationError(this.fields, this.invalidFields);
        } else{
            if(!!this.form.$el.attr('ajax')){
                this.form.onValidationSuccess(this.fields);
            }
        }

        return !this.hasError;
    }

    isValidOptions(field){
        let isValid = true;

        if (field.$el.length === 0){
            isValid = false;
            console.error(`Couldn't find field with associated name :: ${field.name}`);
        }

        if (field.type) {
            if (!Object.keys(this.customFieldType).includes(field.type)) {
                isValid = false;
                console.warn(`The type you want for the ${field.name} field is not supported so it will be validate as a text field. Please refer to documentation.`);
            }
        }

        if (field.required && typeof field.required !== "boolean") {
            isValid = false;
            console.error(`Parammeter 'required' of ${field.name} the field must be boolean.`);
        }

        if (field.copy && this.form.$el.find('[name="' + field.copy + '"]').length < 1) {
            isValid = false;
            console.error(`Couldn't find field that need to have the same value with associated name :: ${field.name}`);
        }

        if (field.regex && !(field.regex instanceof RegExp)) {
            isValid = false;
            console.error(`RegExp on ${field.name} field is not valid.`);
        }

        if (field.filesize && typeof field.filesize !== "number") {
            isValid = false;
            console.error(`Filesize must be a Number.`);
        }

        if (field.placeholder && typeof field.placeholder !== "string") {
            isValid = false;
            console.error(`Placeholder must be String.`);
        }

        if (field.validation && typeof field.validation !== "function") {
            isValid = false;
            console.error(`Validation must be function.`);
        }

        return isValid;
    }

    reset(){
        $.each(this.fields, function(index, field) {
            if (field.type === 'checkbox' || field.type === 'radio') {
                field.$el.attr('checked', false);
            } else if (field.type === 'select'){
                field.$el.val(field.defaultValue.val());
            } else {
                field.$el.val('');
            }

            field.$el.trigger('change');
        });
    }

    set form(scope){
        this._form = scope;
    }

    get form(){return this._form}

    set invalidFields(arr){
        if(typeof arr !== 'object'){
            console.error('The arr parameter must be an array');
            return;
        }

        this._invalidFields = arr;
    }

    get invalidFields(){return this._invalidFields;}

    get baseFieldAttr(){
        return {
            name        	: null,  // REQUIRED, String: name attribute of the field.
            type        	: null,  // String, must be one of the types in customFieldType.
            error_code  	: null,  // copy, empty, regex
            required    	: true,  // Boolean: the non-required fields will be validated (only if they are not empty), which let the user the chocie to leave it empty or not.
            copy	    	: null,  // String: Name of the field element who should have the same value.
            regex			: null,  // Regular Expression
            placeholder		: null,	 // String
            validation		: null,	 // Functions

            //Select options
            default_ok		: false,	 // Bool, if the default option of the select can be a valid option to submit

            //File options
            file_size    	: null,  // Number: filesize allowed in kb
            file_type    	: null,  // Array: types allowed. Exemple: ['.png', '.jpg']
        }
    }

    get customFieldType(){
        return {
            email: {
                regex: new RegExp(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
            },
            phone: {
                regex: new RegExp(/^(?:\+?1)?[-. ]?\(?[2-9][0-8][0-9]\)?[-. ]?[2-9][0-9]{2}[-. ]?[0-9]{4}$/i)
            },
            zipcode: {
                regex: new RegExp(/^[ABCEGHJKLMNPRSTVWXYZ][0-9][ABCEGHJKLMNPRSTVWXYZ]?[ ]?[0-9][ABCEGHJKLMNPRSTVWXYZ][0-9]$/i)
            }
        };
    }

    get validations(){
        return {
            default: (field) => {
                let isValid = true;
                let needToValid = (!!field.required || (!field.required && (!!field.$el.val() || (!!field.$copy && field.$copy.val().length > 1))));

                field.error_code = null;

                if (needToValid) {
                    if(isValid && !field.$el.val()) {isValid = false; field.error_code = 'empty';} // validate empty
                    if(isValid && !!field.$copy && field.$copy.val() !== field.$el.val()) {isValid = false; field.error_code = 'copy';} // validate copy
                    if(isValid && !!field.regex && !field.regex.test(field.$el.val())) {isValid = false; field.error_code = 'regex'}
                }

                return isValid;
            },
            text: (field) => {
                let isValid = true;
                return isValid;
            },
            select: (field) => {
                let isValid = true;
                if (field.required && !field.default_ok && field.$el.val() === field.defaultValue.val()) {isValid = false; field.error_code = 'default_ok';}
                return isValid;
            },
            checkbox: (field) => {
                let isValid = true;
                if (field.required && field.$el.filter(":checked").length === 0) {isValid = false; field.error_code = 'empty';}
                return isValid;
            },
            radio: (field) => {
                let isValid = true;
                if (field.required && field.$el.filter(":checked").length === 0) {isValid = false; field.error_code = 'empty';}
                return isValid;
            },
            file: (field) => {
                let isValid = true;
                let inFileTypesArray = true;
                let regexpFiletypes = /(?:\.([^.]+))?$/;

                if(field.required && field.$el[0].files.length == 0){
                    isValid = false;
                    field.error_code = 'empty';
                    return isValid;
                }

                for(let file of field.$el[0].files){
                    for (let type in field.file_type) {
                        let filetype = regexpFiletypes.exec(file.name);
                        if (field.file_type[type] != filetype[0]) {
                            inFileTypesArray = false;
                        }
                    }
                }

                if(!inFileTypesArray){
                    isValid = false;
                    field.error_code = 'filetype';
                    return isValid;
                }

                if(field.file_size){
                    for(let file of field.$el[0].files){

						//bytes to kilobytes for simplicity...
                        if(file.size/1000 > field.file_size){
                            isValid = false;
                            field.error_code = 'size';
                            return isValid;
                        }
                    }
				}

                return isValid;
            }
        }
    }

    get hasError(){
        return this.invalidFields.length > 0;
    }
}

if(!window.Me){window.Me = {};}
Me.validate = ValidateMe;
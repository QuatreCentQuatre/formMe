class FormBase{
	defaults(){
		return {};
	}
	
	constructor(options){
		this.classes = {
			valid: 			'is-valid',
			invalid: 		'is-invalid',
			error: 			'has-error',
			serverError: 	'has-server-error',
			serverSuccess: 	'has-server-success'
		};
		
		this.el 		= options.el;
		this.$el 		= $(options.el);
		this.params 	= Object.assign(this.defaults(), options.params);
		this.$submit 	= (this.$el.find('[me\\:form\\:submit]').length > 0) ? this.$el.find('[me\\:form\\:submit]') : this.$el.find('[type="submit"]');
		
		this.name 		= (options.name) ? options.name : 'FormBasic';
		this.fields 	= [];
		this.ajax    	= !!this.$el.attr('ajax');
		this.method  	= this.$el.attr('method');
		this.action  	= this.$el.attr('action');
		this.dataType 	= 'json';
		this.antiSpam 	= false;
		this.initialized = false;

		this.recaptcha = (typeof grecaptcha !== 'undefined' && this.ajax && (!this.el.hasAttribute('recaptcha') || this.$el.attr('recaptcha') !== "false"));
		if (this.recaptcha) {
			this.recaptchaAction = this.$el.attr('recaptcha-action') ?? '';
			this.recaptchaInputName = 'g-recaptcha-response';
			this.$recaptchaInput = this.$el.find(`input[name="${this.recaptchaInputName}"]`);
		}

		this.options = {debug: (window.SETTINGS && SETTINGS.DEBUG_MODE) ? SETTINGS.DEBUG_MODE : false};
	}
	
	initialize(){
		if(!this.dependenciesExist() || !this.requirementsExit())
			return;
		
		this.validation = new Me.validate(this);
		
		this.addFields(this.fields);
		this.fields = null;
		
		this.addEvents();
		this.initialized = true;
	}
	
	addEvents(){
		if (this.$submit) {this.$submit.on('click.formMe', (e)=>{this.submitHandler(e)});}
		this.$el.on('submit.formMe', (e)=>{this.submitHandler(e)});
	}
	
	removeEvents(){
		if (this.$submit) {this.$submit.off('click.formMe');}
		this.$el.off('submit.formMe');
	}
	
	addFields(fieldsArr){
		fieldsArr.forEach((field, index) => {
			this.addField(field);
		});
	}
	
	addField(field){
		if (this.validation.fields.findIndex((element) => element.name === field.name) < 0) {
			this.validation.addField(field);
		} else{
			if(this.initialized){
				console.warn('This field already exist', field);
			}
		}
	}
	
	removeFields(namesArr) {
		namesArr.forEach((name, index)=>{
			this.removeField(name);
		});
	};
	
	removeField(name) {
		let field = this.validation.getField(name);
		
		if(field){
			this.resetFieldState(this.getField(name));
			this.validation.removeField(name);
		} else{
			console.warn('This field does not seems to exist.', 'Field name: ' + name);
		}
	};
	
	getField(name) {
		return this.validation.fields.find((el) => {
			return el.name === name;
		})
	};
	
	submitHandler(e){
		if(this.antiSpam) {return;}
		this.antiSpam = true;
		
		if (this.ajax && e) {e.preventDefault();}
		
		if(!this.validation.validate()){
			e.preventDefault();
		}
	}
	
	onValidationSuccess(fields){
		fields.forEach((field, index) => {
			this.resetFieldState(field);
		});
		
		this.$el.removeClass(this.classes.invalid).addClass(this.classes.valid);
		
		if (this.ajax) {
			if (this.recaptcha) {
				grecaptcha.execute(SETTINGS.RECAPTCHA_KEY, { action: this.recaptchaAction }).then((token) => {
					this.$recaptchaInput.val(token);
					this.handleAjaxSend(this.formatFormData(this.$el.serializeArray()));
				});
			} else {
				this.handleAjaxSend(this.formatFormData(this.$el.serializeArray()));
			}
		}
	}
	
	onValidationError(fields, errorFields){
		fields.forEach((field, index) => {
			this.resetFieldState(field);
		});
		
		errorFields.forEach((field, index) =>{
			this.handleValidationErrorField(field);
		});
		
		this.$el.addClass(this.classes.invalid);
		this.antiSpam = false;
	}
	
	resetFieldState(field) {
		//hide previously visible errors from a past validation
		if(field.error){
			field.error.addClass('hide').attr('aria-hidden', true);
		}
		field.$el.removeClass(this.classes.error);
	};
	
	handleValidationErrorField(field) {
		if(field.error){
			field.error.removeClass('hide').attr('aria-hidden', false);
		}
		field.$el.addClass(this.classes.error);
	};
	
	handleAjaxSend(formData){
		$.ajax({
			method: this.method,
			url: this.action,
			data: formData,
			dataType: this.dataType,
			processData: false,
			cache: false,
			contentType: false,
			success: (successObj) => {this.ajaxSuccess(successObj)},
			error: (errorObj) => {this.ajaxError(errorObj)},
			complete: () => {this.ajaxComplete()}
		});
	}
	
	ajaxSuccess(data){
		if(this.dataType === 'json' && Object.entries(data).length === 0){console.warn('No values returned by the service.')}
		this.reset();
		
		this.$el.removeClass(this.classes.serverError).addClass(this.classes.serverSuccess);
	}
	
	ajaxError(error){
		this.$el.removeClass(this.classes.serverSuccess).addClass(this.classes.serverError);
	}
	
	ajaxComplete(){
		this.antiSpam = false;
	}
	
	formatFormData(data) {
		let formattedData = new FormData();
		
		data.forEach((item, index) => {
			let $field = $(`[name="${item.name}"]`);
			if(item.value === "" || $field.disabled || $field.attr('file')){return;}
			let field = this.getField(item.name);
			let value = item.value;
			// @NOTE: sometimes this.getField() returns undefined because some fields are not into the fields definition (like csrf or recaptcha fields)
			if (typeof field !== 'undefined' && field.hasOwnProperty('format')) {
				value = field.format(value);
			}
			formattedData.append(item.name, value);
		});
		
		//@note serializeArray does not serialize file select elements.
		this.validation.fields.forEach((item, index) => {
			if (item.file_type != undefined) {
				let field = $(`[name="${item.name}"]`);
				if (field[0].files[0]) {
					let filesArr = [];
					
					for (const prop in field[0].files){
						if(field[0].files[prop].name && field[0].files[prop].size){
							filesArr.push(field[0].files[prop]);
						}
					}
					
					formattedData.append(item.name, filesArr);
				}
			}
		});
		
		return formattedData;
	};
	
	dependenciesExist(){
		let isValid = true;
		
		if (!window.$) {
			isValid = false;
			console.error(`Form ${this.name} needs Jquery.`);
		}
		if (!window.Me || !window.Me.validate) {
			isValid = false;
			console.error(`Form ${this.name} needs ValidateMe (https://github.com/QuatreCentQuatre/validateMe/)`);
		}
		
		return isValid;
	}
	
	requirementsExit(){
		let isValid = true;
		
		if (!this.$el.length > 0) {
			isValid = false;
			console.error("Couldn't find associated form name", this.name);
		}
		
		if (!this.method) {
			isValid = false;
			console.error(`${this.name} needs to have a method`);
		}
		
		if (!this.action) {
			isValid = false;
			console.error(`${this.name} needs to have an action attribute`);
		}
		
		if(!this.fields || this.fields && this.fields.length <= 0){
			console.error(`${this.name} needs a list of fields. To see what you need to add go check de README.md`);
			return;
		}
		
		if (!this.$submit.length > 0) {
			isValid = false;
			console.error(`${this.name} needs to have a submit button`);
		}

		if (this.recaptcha) {
			if (!window.SETTINGS || !SETTINGS.RECAPTCHA_KEY) {
				isValid = false;
				console.error(`SETTINGS.RECAPTCHA_KEY needs to be defined`);
			}

			if (!this.recaptchaAction) {
				isValid = false;
				console.error(`${this.name} needs to have a recaptcha-action attribute`);
			}

			if (this.$recaptchaInput.length === 0) {
				isValid = false;
				console.error(`${this.name} needs to have a input[name="${this.recaptchaInputName}"]`);
			}
		}
		
		return isValid;
	}
	
	reset() {
		this.validation.reset();
		return this;
	};
	
	terminate(){
		this.removeEvents();
	}
	
	set name(name){
		if(typeof name !== "string"){
			console.error('The name parameter must be a string');
			return;
		}
		
		this._name = name;
	}
	get name(){return this._name;}
	
	set dataType(dataType){
		if(typeof dataType !== "string"){
			console.error('The dataType parameter must be a string');
			return;
		}
		
		this._dataType = dataType;
	}
	get dataType(){return this._dataType;}
	
	set ajax(bool){
		if(typeof bool !== "boolean"){
			console.error('The bool parameter must be a boolean');
			return;
		}
		
		this._ajax = bool;
	}
	get ajax(){return this._ajax;}
	
	set method(method){
		if(typeof method !== "string"){
			console.error('The method parameter must be a string');
			return;
		}
		
		this._method = method;
	}
	get method(){return this._method;}
	
	set action(action){
		if(typeof action !== "string"){
			console.error('The method parameter must be a string');
			return;
		}
		
		this._action = action;
	}
	get action(){return this._action;}
	
	set antiSpam(bool){
		if(typeof bool !== "boolean"){
			console.error('The bool parameter must be a boolean');
			return;
		}
		
		this._antiSpam = bool;
	}
	get antiSpam(){return this._antiSpam;}
	
	set fields(fields){
		if(typeof fields !== "object" && fields.length > 0){
			console.error('The fields parameter must be an array');
			return;
		}
		this._fields = fields;
	}
	
	get fields(){return this._fields;}
	
	set initialized(bool){
		this._initialized = bool;
	}
	
	get initialized(){return this._initialized;}

	set recaptcha(bool) {
		if (typeof bool !== "boolean") {
			console.error('The recaptcha parameter must be a boolean');
			return;
		}

		this._recaptcha = bool;
	}
	get recaptcha() { return this._recaptcha; }

	set recaptchaAction(string) {
		if (typeof string !== "string") {
			console.error('The recaptchaAction parameter must be a string');
			return;
		}

		this._recaptchaAction = string;
	}
	get recaptchaAction() { return this._recaptchaAction; }

	set recaptchaInputName(string) {
		if (typeof string !== "string") {
			console.error('The recaptchaInputName parameter must be a string');
			return;
		}

		this._recaptchaInputName = string;
	}
	get recaptchaInputName() { return this._recaptchaInputName; }
}

Me.forms['FormBase'] = FormBase;
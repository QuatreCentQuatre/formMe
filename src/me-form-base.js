class FormBase{
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
		this.params 	= (options.params) ? options.params : {};
		this.$submit 	= (this.$el.find('[me\\:form\\:submit]').length > 0) ? this.$el.find('[me\\:form\\:submit]') : this.$el.find('[type="submit"]');
		
		this.name 		= (options.name) ? options.name : 'FormBasic';
		this.fields 	= [];
		this.ajax    	= !!this.$el.attr('ajax');
		this.method  	= this.$el.attr('method');
		this.action  	= this.$el.attr('action');
		this.dataType 	= 'json';
		this.antiSpam 	= false;
		this.initialized = false;
		
		this.options = {debug: (window.SETTINGS && SETTINGS.DEBUG_MODE) ? SETTINGS.DEBUG_MODE : false};
	}
	
	initialize(){
		if(!this.dependenciesExist() || !this.requirementsExit())
			return;
		
		this.validation = new ValidateMe(this);
		
		this.fields.forEach((field, index) => {
			this.addField(field);
		});
		
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
	
	addField(field){
		if (!!this.getField(field)) {
			this.fields.push(field);
		} else{
			if(this.initialized){
				console.warn('This field already exist', field);
			}
		}
		
		this.validation.addField(field);
	}
	
	removeField(name) {
		let field = this.getField(name);
		
		if(field){
			this.fields.splice(index, 1);
			this.validation.removeField(field);
		}
	};
	
	getField(name) {
		return this.fields.find((el) => {
			return el.name === name;
		})
	};
	
	submitHandler(e){
		if (this.ajax && e) {e.preventDefault();}
		
		if(!this.validation.validate()){
			e.preventDefault();
		}
	}
	
	onValidationSuccess(fields){
		fields.forEach((field, index) => {
			this.handleValidationSuccessField(field);
		});
		
		this.$el.removeClass(this.classes.invalid).addClass(this.classes.valid);
		
		if (this.ajax) {
			this.handleAjaxSend(this.formatFormData(this.$el.serializeArray()));
		}
	}
	
	onValidationError(fields, errorFields){
		fields.forEach((field, index) => {
			this.handleValidationSuccessField(field);
		});
		
		errorFields.forEach((field, index) =>{
			this.handleValidationErrorField(field);
		});
		
		this.$el.addClass(this.classes.invalid);
	}
	
	handleValidationSuccessField(field) {
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
		if(this.antiSpam) {return;}
		this.antiSpam = true;
		
		$.ajax({
			method: this.method,
			url: this.action,
			data: formData,
			dataType: this.dataType,
			success: (successObj) => {this.ajaxSuccess(successObj)},
			error: (errorObj) => {this.ajaxError(errorObj)}
		});
	}
	
	ajaxSuccess(data){
		this.antiSpam = false;
		
		if(this.dataType === 'json' && Object.entries(data).length === 0){console.warn('No values returned by the service.')}
		this.reset();
		
		this.$el.removeClass(this.classes.serverError).addClass(this.classes.serverSuccess);
	}
	
	ajaxError(error){
		this.antiSpam = false;
		this.$el.removeClass(this.classes.serverSuccess).addClass(this.classes.serverError);
	}
	
	formatFormData(data) {
		let formattedData = {};
		
		data.forEach(function(item, index) {
			let field = $(`[name="${item.name}"]`);
			
			if(item.value === "" || field.disabled){return;}
			formattedData[item.name] = item.value;
			
			if (item.filetype != undefined) {
				
				if (field[0].files[0]) {
					formattedData.append(item.name, field[0].files[0]);
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
}

Me.forms['FormBase'] = FormBase;
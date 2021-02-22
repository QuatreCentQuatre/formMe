class Form extends FormBase{
	constructor(options){
		super(options);

		this.fields = [
			{name:'name', required: false, validation: this.validateName},
			{name:'phone', regex: new RegExp(/^\d{3}-\d{3}-\d{4}$/)},
		];
	}
	
	validateName(field){
		return true;
	}
}

Me.forms['Form'] = Form;
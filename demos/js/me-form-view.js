class Form extends FormBase{
	defaults() {
		return {
			'base': 'base',
			'extend':'base'
		}
	}
	
	constructor(options){
		super(options);
		this.fields = [
			{name:'name', required: false},
			{name:'phone', regex: new RegExp(/^\d{3}-\d{3}-\d{4}$/), mask_options:{
				mask: '000-000-000',
					lazy: false
				}},
			{name:'format', format: this.toUppercase.bind(this)},
			{name: 'file[]', required: false, file_size: 4000, file_type: ['.png', '.jpg']},
		];
	}
	
	validateName(field){
		return true;
	}

	toUppercase(value) {
		return value.toUpperCase();
	}
}

Me.forms['Form'] = Form;
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
			{name:'name', required: false}
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
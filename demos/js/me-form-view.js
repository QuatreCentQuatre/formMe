class Form extends FormBase{
	constructor(options){
		super(options);

		this.fields = [
			{name:'name', required: false, validation: this.validateName},
			{name:'lastname'},
			{name:'copy-name', copy:'name', required: false},
			{name:'no-value', required: false},
			{name:'checkbox', required: false},
			{name:'file', file_size: 2000, file_type: ['.png']},
			{name:'select-1'},
		];
	}

	validateName(field){
		return true;
	}
}

Me.forms['Form'] = Form;
class FormAccessible extends FormBase{
	constructor(options){
		super(options);

		this.fields = [
			{name:'name', required: true, error: $('#name-error-message')},
			{name:'lastname', error: $('#last-error-message')},
		];
	}
}

Me.forms['FormAccessible'] = FormAccessible;
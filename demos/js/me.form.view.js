class Form extends FormBase{
	constructor(options){
		super(options);

		this.fields = [
			{name:'name', required: false},
			{name:'lastname'},
			{name:'copy-name', copy:'name'},
			{name:'no-value'},
			{name:'checkbox'},
			{name:'select-1'},
			{name:'file', required: false, filetypes: ['.png', '.jpg']}
		];
	}
}

Me.forms['Form'] = Form;
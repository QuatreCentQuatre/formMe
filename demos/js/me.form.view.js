class Formulaire extends FormBase{
	constructor(options){
		super(options);

		this.fields = [
			{name:'name', required: false},
			{name:'last'},
			{name:'copy-name', copy:'name'},
			{name:'no-value'},
			{name:'checkbox'},
			{name:'select-1'},
			{name:'file', required: false, filetypes: ['.png', '.jpg']}
		];

		// validation.addField({name: 'no-placeholder'});
		// validation.addField({name: 'not-required', required:false});
		// validation.addField({name: 'postal', type:'zipcode'});
		// validation.addField({name: 'phone', type:'phone'});
		// validation.addField({name: 'email', type:'email'});
		// validation.addField({name: 'email-copy', type:'email', copy:'email'});
		// validation.addField({name: 'password'});
		// validation.addField({name: 'checkbox'});
		// validation.addField({name: 'radio'});
		// validation.addField({name: 'file', filetype:'.doc, .pdf,.txt'});

		this.dataType = 'json';
	}
}

Me.forms['Formulaire'] = Formulaire;
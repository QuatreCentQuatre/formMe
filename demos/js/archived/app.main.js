$(document).ready(function() {
	// let form = new Formulaire({
	// 	formID: 'formES',
	// 	dataType: 'json',
	// 	fields: [
	// 		{name:'name', required: false},
	// 		{name:'last', required: false}
	// 	]
	// });

	// let formES = new FormMe({
	// 	formID: 'formES',
	// 	dataType: 'json',
	// 	fields: [
	// 		{name:'name', required: false}
	// 	]
	// });

	var formAccount = new Me.form($('.form-account-login'), {
		form_scope: this,
		fields:[
			{name: 'no-placeholder'},
			{name: 'not-required', required:false},
			{name: 'postal', type:'zipcode'},
			{name: 'phone', type:'phone'},
			{name: 'email', type:'email'},
			{name: 'email-copy', type:'email', copy:'email'},
			{name: 'password'},
			{name: 'checkbox'},
			{name: 'radio'},
			{name: 'file', filetype:'.doc, .pdf,.txt'}
		],
		onSuccess: formAjaxSuccess,
		onError: formAjaxError
	});

	function formAjaxSuccess(formScope, data) {
		console.log(data);
	}

	function formAjaxError(formScope, error) {
		console.log(error);
	}
});
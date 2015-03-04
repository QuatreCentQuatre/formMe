$(document).ready(function(){
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

	var formAccount2 = new Me.form($('.form-account-login-2'), {
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

	function formAjaxSuccess(data) {
		console.log(data);
	}

	function formAjaxError(error) {
		console.log(error);
	}
});
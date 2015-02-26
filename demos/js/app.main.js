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

    function formAjaxSuccess(data) {
        this.antiSpam = false;
        if (data.response.success == 0) {
            $.each(validation.validation.fields, function(index, field) {
                field.$el.addClass('error');
            });
        }
    }

    function formAjaxError(error) {
        this.antiSpam = false;
    }

	console.log(formAccount);
});
class FormAccessibleExtra extends FormBase{
	constructor(options){
		super(options);

		this.fields = [
			{name:'name'},
			{name:'email', type: 'email'},
		];
	}
	
		resetFieldState(field) {
		//do not forget to reset your custom error displaying when a field is valid.
        super.resetFieldState(field);

        field.$el.siblings('.error-message').addClass('hide').attr('aria-hidden', true);
    }

    handleValidationErrorField(field) {

		super.handleValidationErrorField(field);

		if(field.error_code){
			//There are many ways to find the related errors message, this one works for me in this case.
			//i'm using the error code to find the right error message
			//it could be a simple switch() scenario and works as well.

			//hide previously revealed errors for a particular field
            field.$el.siblings('.error-message').addClass('hide').attr('aria-hidden', true);
            //then hide the error message related to the field's error code.
            field.$el.siblings('.error-message[data-error-code="' + field.error_code + '"]').removeClass('hide').attr('aria-hidden', false);
		}
    };
}

Me.forms['FormAccessibleExtra'] = FormAccessibleExtra;
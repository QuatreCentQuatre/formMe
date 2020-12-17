/*
 * FormMe 2.0.2 (https://github.com/QuatreCentQuatre/formMe/)
 * Make form system usage easy
 *
 * Licence :
 *  - GNU v2
 *
 * Methods:
 *
 *
 *
 *
 *
 *
 */

class FormManager {
	constructor(options) {
		this.name     = "FormManager";
		this.defaults = {};
		this.forms    = [];
		this.options = {};

		this.setOptions(options);
	}

	setOptions(options) {
		this.options = Object.assign(this.options, this.defaults, options);
	}

	/*
	*
	* initForms($rootElement)
	* - Will init all forms
	*
	* Params:
	* - $rootElement : Accept one parameter to define where the search of forms will start in the DOM
	*
	* Output:
	* No output
	*
	* Results:
	* It will instantiate all forms in DOM and trigger their init once they are all created.
	*
	* */

	initForms($rootElement = $('html')){
		this.clearForms();

		let forms = $rootElement.find('[me\\:form]');
		let newForms = [];

		for (let i = 0; i < forms.length; i++) {
			let $form = $(forms[i]);
			let formName = $form.attr('me:form');
			let formParams = {el: $form[0], name: formName, params: {}};

			/* Look if the form is valid */
			if (typeof Me.forms[formName] !== "function") {
				console.warn("You need to have form that exist.", formName);
				continue;
			}

			/* Look if the form has already been rendered */
			if ($form.attr('me:form:render')) {continue;}
			$form.attr('me:form:render', "true");

			/* Add data to form */
			// let formData = $form.attr('me:form:data');
			// formParams.params.data = (formData) ? JSON.parse(formData) : {};

			/* Create instance of the form */
			let form = new Me.forms[formName](formParams);

			/* Keep reference of the global form in this class */
			this.forms.push(form);

			/* Assign the form in an array to initialize them later */
			newForms.push(form);
		}

		/* Initialize all new forms*/
		for (let j = 0; j < newForms.length; j++) {
			newForms[j].initialize();
		}
	}

	/*
	*
	* clearForms()
	* - To clear unused forms
	*
	* Params:
	* None
	*
	* Output:
	* None
	*
	* Results:
	* It will delete all unused forms and refresh the current forms array
	*
	* */

	clearForms(){
		let activeForms  = [];
		for (let i in this.forms) {
			let form = this.forms[i];
			if(typeof form.$el == "object"){
				let selector = $('html').find(form.$el[0]);

				if (selector.length > 0) {
					activeForms.push(form);
				} else {
					form.terminate();
				}
			}
		}

		this.forms = activeForms;
	}

	get name () {
		return this._name;
	}

	set name (name) {
		this._name = name;
	}
}

if(!window.Me){window.Me = {};}

Me.formManager = new FormManager();
Me.forms = [];

$(document).ready(function() {
	Me.formManager.initForms();
});

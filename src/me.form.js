/*
 * FormMe from the MeLibs
 * Library that let you easily handle a full form validation
 * Dependencies :
 *  - Jquery
 *  - jqueryMaskedInput
 *  - ValidateMe
 *
 * Private Methods :
 * 	- reformatFormData
 *
 * Public Methods :
 *
 */

(function($, window, document, undefined) {
	"use strict";
	/* Private Variables */
	var instanceID   = 1;
	var instanceName = "FormMe";
	var defaults     = {
		debug: false
	};
	var overwriteKeys = [
		'debug',
		'$messages',
		'$btn',
		'form_scope',
		'fields',
		'disabled',
		'accepted_empty',
		'onValidationError',
		'onValidationSuccess',
		'handleValidationErrorField',
		'handleValidationSuccessField',
		'onAllSuccess',
		'onAllError',
		'onSuccess',
		'onError'
	];

	/* Private Methods */
	var privatesMethods = {};
	/**
	 *
	 * reformatFormData
	 * will reformat all the form data to a final object.
	 *
	 * @param   data     all data that need to be reformated (obj)
	 * @return  object   reformated data
	 * @access  private
	 *
	 */
	privatesMethods.reformatFormData = function(data) {
		var $scope    = this;
		var finalData = {};
		$.each(data, function(index, item) {
			if (item.name == "postal_code") {item.value = item.value.toUpperCase();}
			var checkIfEmpty = true;
			if ($scope.accepted_empty && $.inArray(item.name, $scope.accepted_empty) != -1) {checkIfEmpty = false;}
			if (checkIfEmpty && item.value == "") {return;}
			if ($scope.disabled && $.inArray(item.name, $scope.disabled) != -1) {return;}
			finalData[item.name] = item.value;
		});
		return finalData;
	};

	/* Builder Method */
	var FormMe = function($el, options) {
		this.__construct($el, options);
	};
	var proto = FormMe.prototype;

	proto.debug          = null;
	proto.id             = null;
	proto.name           = null;
	proto.dname          = null;
	proto.tracker_name   = null; //check: if TrackMe exist and this.$form.attr('me\\:validate\\:analytics');
	proto.options        = null;

	/* Publics Variables */
	proto.$form          = null;
	proto.$messages      = null; //check: this.$form.find('.form-messages');
	proto.$btn 	         = null; //check: this.$form.find('.btn-submit');

	proto.form_scope     = null;
	proto.ajax           = true; //check: this.$form.attr('ajax');
	proto.type           = null; //check: this.$form.attr('method');
	proto.action         = null; //check: this.$form.attr('action');
	proto.skinMe_enabled = null; //check: if SkinMe exist and this.$form.hasClass('skinMe');

	proto.fields         = null;
	proto.disabled       = null;
	proto.accepted_empty = null;

	proto.trackingMessages = {
		onValidationErreur: function() {
			Me.track.event('formulaire', this.tracker_name, 'validation non réussite');
		},
		onValidationSuccess: function() {
			Me.track.event('formulaire', this.tracker_name, 'validation réussite');
		},
		onAjaxSendSuccess: function() {
			Me.track.event('formulaire', this.tracker_name, 'envoi réussi');
		},
		onAjaxSendError: function() {
			Me.track.event('formulaire', this.tracker_name, 'envoi non réussi');
		}
	};

	/**
	 *
	 * __construct
	 * the first method that will be executed.
	 *
	 * @param   $el      the current form $element
	 * @param   options  all the options that you need
	 * @return  object    null || scope
	 * @access  private
	 */
	proto.__construct = function($el, options) {
		this.id    = instanceID;
		this.name  = instanceName + "-" + String(this.id);
		this.dname = this.name + ":: ";
		this.$form = $el;
		this.setOptions(options);

		if (!this.__validateDependencies()) {return null;}
		if (!this.__validateOptions()) {return null;}
		instanceID ++;

		this.__variables();
		this.__initialize();
		return this;
	};

	/**
	 *
	 * __validateDependencies
	 * Will check if you got all the dependencies needed to use that plugins
	 *
	 * @return  boolean
	 * @access  private
	 *
	 */
	proto.__validateDependencies = function() {
		var isValid = true;
		if (!window.jQuery) {
			isValid = false;
			console.warn(this.dname + "You need jquery");
		}
		if (!window.Me || !window.Me.validate) {
			isValid = false;
			console.warn(this.dname + "You need ValidateMe (https://github.com/QuatreCentQuatre/validateMe/)");
		}
		return isValid;
	};

	/**
	 *
	 * __validateOptions
	 * Will check if you got all the required options needed to use that plugins
	 *
	 * @return  boolean
	 * @access  private
	 *
	 */
	proto.__validateOptions = function() {
		var isValid = true;
		if (isValid && !this.$form.length > 0) {
			isValid = false;
			console.warn(this.dname + "Couldn't find associated form ", this.$form);
		}

		if (isValid && !this.$form.attr('method')) {
			isValid = false;
			console.warn(this.dname + "You need to add method to your form ", this.$form.attr('method'));
		}

		if (isValid && this.$form.attr('action') == null) {
			isValid = false;
			console.warn(this.dname + "You need to add action to your form ", this.$form.attr('action'));
		}

		if (isValid && this.$form.hasClass('skinMe') && (!window.Me || !Me.skin)) {
			isValid = false;
			console.warn(this.dname + "You need skinMe if you wanna enabled that option (https://github.com/QuatreCentQuatre/skinMe/)");
		}

		if (isValid && this.$form.attr('me:validate:analytics') && (!window.Me || !Me.track)) {
			isValid = false;
			console.warn(this.dname + "if you want autotracking enabled you need trackMe (https://github.com/QuatreCentQuatre/trackMe/)");
		}
		return isValid;
	};

	/**
	 *
	 * setOptions
	 * will merge options to the plugin defaultKeys and the rest will be set as additionnal options
	 *
	 * @param   options
	 * @return  object scope
	 * @access  public
	 *
	 */
	proto.setOptions = function(options) {
		var $scope = this;
		var settings = $.extend({}, defaults, options);
		$.each(settings, function(index, value) {
			if ($.inArray(index, overwriteKeys) != -1) {
				$scope[index] = value;
				delete settings[index];
			}
		});
		this.options = settings;
		return this;
	};

	/**
	 *
	 * getOptions
	 * return the additional options that left
	 *
	 * @return  object options
	 * @access  public
	 *
	 */
	proto.getOptions = function() {
		return this.options;
	};

	/**
	 *
	 * __variables
	 * it will set all basic variables from the plugins
	 *
	 * @return  object scope
	 * @access  private
	 *
	 */
	proto.__variables = function() {
		this.tracker_name   = (this.$form.attr('me\\:validate\\:analytics')) ? this.$form.attr('me\\:validate\\:analytics') : null;

		this.$messages      = (this.$messages) ? this.$form.find(this.$messages) : (this.$form.find('.form-messages').length > 0) ? this.$form.find('.form-messages') : null;
		this.$btn           = (this.$btn) ? this.$form.find(this.$btn) : (this.$form.find('.btn-submit').length > 0) ? this.$form.find('.btn-submit') : null;

		this.ajax           = (this.$form.attr('ajax')) ? (this.$form.attr('ajax') === "true") : this.ajax;
		this.type           = this.$form.attr('method');
		this.action         = this.$form.attr('action');
		this.skinMe_enabled = this.$form.hasClass('skinMe');

		return this;
	};

	/**
	 *
	 * __initialize
	 * set the basics
	 *
	 * @return  object scope
	 * @access  private
	 *
	 */
	proto.__initialize = function() {
		var $scope = this;
		if (this.skinMe_enabled) {this.skinMe = new Me.skin(this.$form);}
		this.validation = new Me.validate(this.$form, {scope:this, debug:this.debug, onError:this.onValidationError, onSuccess:this.onValidationSuccess});
		$.each(this.fields, function(index, field) {$scope.addField(field);});

		if (this.$btn) {this.$btn.on('click.formMe', $.proxy(this.clickSubmitHandler, this));}
		this.$form.on('submit.formMe', $.proxy(this.submitHandler, this));

		return this;
	};

	/**
	 *
	 * addField
	 * will add the field to validation
	 *
	 * @param   field {object}
	 * @return  object scope
	 * @access  public
	 *
	 */
	proto.addField = function(field) {
		if (this.debug) {console.info(this.dname, "addField");}
		this.validation.addField(field);
		return this;
	};

	/**
	 *
	 * removeField
	 * will remove the field from validation
	 *
	 * @param   name input name to remove
	 * @return  object scope
	 * @access  public
	 *
	 */
	proto.removeField = function(name) {
		if (this.debug) {console.info(this.dname, "removeField");}
		var fieldIndex    = null;
		var fieldToRemove = null;
		$.each(this.fields, function(index, value) {
			if(name == value.name) {
				fieldToRemove = value;
				fieldIndex    = index;
			}
		});

		if (fieldToRemove) {
			this.fields.splice(fieldIndex, 1);
			this.validation.removeField(fieldToRemove);
		}
		return this;
	};

	/**
	 *
	 * clickSubmitHandler
	 * will toggle a $form submit
	 *
	 * @param   e event
	 * @return  void
	 * @access  public
	 *
	 */
	proto.clickSubmitHandler = function(e) {
		if (this.debug) {console.info(this.dname, "clickSubmitHandler");}
		e.preventDefault();
		this.$form.submit();
	};

	/**
	 *
	 * submitHandler
	 * handle the $form submit
	 *
	 * @param   e event
	 * @return  boolean (if not ajax) || void (if ajax)
	 * @access  public
	 *
	 */
	proto.submitHandler = function(e) {
		if (this.debug) {console.info(this.dname, "submitHandler");}
		if (this.ajax) {
			e.preventDefault();
		}

		var response = false;
		if (this.validation.validate()) {
			response = true;
		}
		return response;
	};

	/**
	 *
	 * handleAjaxSend
	 * this will submit your form via ajax if you set ajax to true
	 *
	 * @param   data object
	 * @return  void
	 * @access  public
	 *
	 */
	proto.handleAjaxSend = function(data) {
		if (this.debug) {console.info(this.dname, "handleAjaxSend");}
		if(this.antiSpam) {return;}
		this.antiSpam = true;

		$.ajax({
			method: this.type,
			url: this.action,
			data: data,
			type: 'json',
			dataType: 'json',
			success: $.proxy(this.ajaxSuccess, this),
			error: $.proxy(this.ajaxError, this)
		});
	};


	/**
	 *
	 * reset
	 * this will call a reset of the validation fields
	 *
	 * @return  object scope
	 * @access  public
	 *
	 */
	proto.reset = function() {
		this.validation.reset();
		return this;
	};

	/**
	 *
	 * onValidationSuccess
	 * this is where you determine what happen when the validation has been successful
	 *
	 * @param   fields array
	 * @return  object scope
	 * @access  public
	 *
	 */
	proto.onValidationSuccess = function(fields) {
		if (this.debug) {console.info(this.dname, "onValidationSuccess");}
		var field;
		for (var fieldKey = 0; fieldKey < fields.length; fieldKey++) {
			field = fields[fieldKey];
			this.handleValidationSuccessField(field);
		}

		if (this.$messages) {
			this.$messages.find('.error').addClass('hide');
			this.$messages.find('.error-none').removeClass('hide');
		}

		if (this.tracker_name) {this.trackingMessages.onValidationSuccess();}
		if (this.ajax) {this.handleAjaxSend(privatesMethods.reformatFormData.call(this, this.$form.serializeArray()));}
		return this;
	};

	/**
	 *
	 * onValidationError
	 * this is where you determine what happen when the validation has trigger an error
	 *
	 * @param   fields array
	 * @param   errorFields array
	 * @return  object scope
	 * @access  public
	 *
	 */
	proto.onValidationError = function(fields, errorFields) {
		if (this.debug) {console.info(this.dname, "onValidationError");}
		var field;
		for (var fieldKey = 0; fieldKey < fields.length; fieldKey++) {
			field = fields[fieldKey];
			this.handleValidationSuccessField(field);
		}

		var emptyField = false;
		for (var errorFieldKey = 0; errorFieldKey < errorFields.length; errorFieldKey++) {
			field = errorFields[errorFieldKey];
			this.handleValidationErrorField(field);
			if (field.$el.val() == field.$el[0].defautValue || field.$el.val() == field.placeholder || field.$el.val() == field.error) {
				emptyField = true;
			}
		}

		if (this.$messages) {
			this.$messages.find('.error').addClass('hide');
			if (emptyField) {
				this.$messages.find('.error-empty').removeClass('hide');
			} else {
				this.$messages.find('.error-validation').removeClass('hide');
			}
		}

		if (this.tracker_name) {this.trackingMessages.onValidationErreur();}
		return this;
	};

	/**
	 *
	 * handleValidationSuccessField
	 * this is where you determine what happen with the field that don't have an error
	 *
	 * @param   field object
	 * @return  void
	 * @access  public
	 *
	 */
	proto.handleValidationSuccessField = function(field) {
		field.$el.removeClass('error');
		if (field.$skin) {field.$skin.removeClass('error');}
		if (field.$label) {field.$label.removeClass('error');}
		if (field.$related) {field.$related.removeClass('error');}
		if (field.$el.parents(".dk_container").length > 0) {field.$el.parents(".dk_container").removeClass('error');}
		if (field.errors.length > 0) {
			$.each(field.errors, function(index, $item) {
				$item.removeClass('error');
			});
		}
	};

	/**
	 *
	 * handleValidationErrorField
	 * this is where you determine what happen with the field that have an error
	 *
	 * @param   field object
	 * @return  void
	 * @access  public
	 *
	 */
	proto.handleValidationErrorField = function(field) {
		if (this.debug) {console.info(this.dname, "handleValidationErrorField", field);}
		field.$el.addClass('error');
		if (field.$skin) {field.$skin.addClass('error');}
		if (field.$label) {field.$label.addClass('error');}
		if (field.$related) {field.$related.addClass('error');}
		if (field.$el.parents(".dk_container").length > 0) {field.$el.parents(".dk_container").addClass('error');}
		if (field.errors.length > 0) {
			$.each(field.errors, function(index, $item) {
				$item.addClass('error');
			});
		}
	};

	/**
	 *
	 * ajaxSuccess
	 * this is where you can say what happen after the form was send via ajax and obtain a success
	 *
	 * @param   data object
	 * @return  void
	 * @access  public
	 *
	 */
	proto.ajaxSuccess = function(data) {
		if (this.debug) {console.info(this.dname, "ajaxSuccess");}
		this.onAllSuccess.call(this, data);
		this.onSuccess.call(this, this.form_scope, data);
		this.antiSpam = false;
		if (data.response && data.response.success == 1) {
			if (this.tracker_name) {this.trackingMessages.onAjaxSendSuccess();}
		}
	};

	/**
	 *
	 * ajaxError
	 * this is where you can say what happen after the form was send via ajax and obtain an error
	 *
	 * @param   error object
	 * @return  void
	 * @access  public
	 *
	 */
	proto.ajaxError = function(error) {
		if (this.debug) {console.info(this.dname, "ajaxError");}
		this.onAllError.call(this, error);
		this.onError.call(this, this.form_scope, error);
		this.antiSpam = false;
		if (this.tracker_name) {this.trackingMessages.onAjaxSendError();}
	};

	/**
	 *
	 * onAllSuccess
	 * this is a methods you can overwrite to tell all your form to do something if ajax call have been successful
	 * for now it will only reset the fields
	 *
	 * @param   data object
	 * @return  void
	 * @access  public
	 *
	 */
	proto.onAllSuccess = function(data) {
		if (this.debug) {console.info(this.dname, "onAllSuccess");}
		if (data.response && data.response.success) {
			this.reset();
		} else if (data.success) {
			this.reset();
		}
	};

	/**
	 *
	 * onAllError
	 * this is a methods you can overwrite to tell all your form to do something if ajax call return you an error
	 *
	 * @param   error object
	 * @return  void
	 * @access  public
	 *
	 */
	proto.onAllError = function(error) {
		if (this.debug) {console.info(this.dname, "onAllError");}

	};

	/**
	 *
	 * onSuccess
	 * this method is required in your instance parameters
	 *
	 * @param   formScope scope
	 * @param   data object
	 * @return  void
	 * @access  public
	 *
	 */
	proto.onSuccess = function(formScope, data) {
		if (this.debug) {console.info(this.dname, "onSuccess");}
		console.log(data);
	};

	/**
	 *
	 * onError
	 * this method is required in your instance parameters
	 *
	 * @param   formScope scope
	 * @param   error object
	 * @return  void
	 * @access  public
	 *
	 */
	proto.onError = function(formScope, error) {
		if (this.debug) {console.info(this.dname, "onError");}
		console.log(error);
	};

	proto.toString = function(){
		return "[" + this.name + "]";
	};

	/* Create Me reference if does'nt exist */
	if(!window.Me){window.Me = {};}
	window.Me.form = FormMe;
}(jQuery, window, document));
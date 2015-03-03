/*
 * FormMe from the MeLibs
 * Librairy to handle form easily
 * Requires : Jquery, jqueryMaskedInput, ValidateMe
 *
 * Private Methods :
 * 	- reformatFormData
 *
 * Public Methods :
 * 	- __construct
 */

(function($, window, document, undefined) {
	"use strict";

	/* Private Variables */
	var $scope;
	var instanceID   = 1;
	var instanceName = "FormMe-";
	var defaults     = {
		debug: false,
		ajax: true,
		action: '',
		skinMe: false
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
		'onAllSuccess',
		'onSuccess',
		'onAllError',
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
		var finalData = {};
		var scope     = this;
		$.each(data, function(index, item) {
			if (item.name == "postal_code") {
				item.value = item.value.toUpperCase();
			}

			var checkIfEmpty = true;
			if (scope.accepted_empty && $.inArray(item.name, scope.accepted_empty) != -1) {checkIfEmpty = false;}
			if (checkIfEmpty && item.value == "") {return;}
			if (scope.disabled && $.inArray(item.name, scope.disabled) != -1) {return;}
			finalData[item.name] = item.value;
		});
		return finalData;
	};

	/* Builder Method */
	var FormMe = function($el, options) {
		$scope = this;
		$scope.__construct($el, options);
	};
	var p = FormMe.prototype;
	p.debug          = null;
	p.id             = null;
	p.name           = null;
	p.debug_name     = null;
	p.tracker_name   = null; //check: if TrackMe exist and $scope.$form.attr('me\\:validate\\:analytics');
	p.options        = null;

	/* Publics Variables */
	p.$form          = null;
	p.$messages      = null; //check: $scope.$form.find('.form-messages');
	p.$btn 	         = null; //check: $scope.$form.find('.btn-submit');

	p.form_scope     = null;
	p.ajax           = null; //check: $scope.$form.attr('ajax');
	p.type           = null; //check: $scope.$form.attr('method');
	p.action         = null; //check: $scope.$form.attr('action');
	p.skinMe_enabled = null; //check: if SkinMe exist and $scope.$form.hasClass('skinMe');

	p.fields         = null;
	p.disabled       = null;
	p.accepted_empty = null;

	p.trackingMessages = {
		onValidationErreur: function() {
			Me.track.event('formulaire', $scope.tracker_name, 'validation non réussite');
		},
		onValidationSuccess: function() {
			Me.track.event('formulaire', $scope.tracker_name, 'validation réussite');
		},
		onAjaxSendSuccess: function() {
			Me.track.event('formulaire', $scope.tracker_name, 'envoi réussi');
		},
		onAjaxSendError: function() {
			Me.track.event('formulaire', $scope.tracker_name, 'envoi non réussi');
		}
	};

	/**
	 *
	 * __construct
	 * the first method that will be executed.
	 *
	 * @param   $el      the current form $element
	 * @param   options  all the options that you need
	 * @return  mixed    null || scope
	 * @access  public
	 * @constructor
	 */
	p.__construct = function($el, options) {
		$scope.id    = instanceID;
		$scope.name  = instanceName + String($scope.id);
		$scope.dname = $scope.name + ":: ";
		$scope.$form = $el;
		$scope.setOptions(options);

		if (!$scope.__validateDependencies()) {return null;}
		if (!$scope.__validateOptions()) {return null;}

		$scope.setVariables();
		$scope.initForm();
		instanceID ++;
		return $scope;
	};

	/**
	 *
	 * __validateDependencies
	 * Will check if you got all the dependencies needed to use that plugins
	 *
	 * @return  boolean
	 * @access  public
	 *
	 */
	p.__validateDependencies = function() {
		var isValid = true;
		if (!window.jQuery) {
			isValid = false;
			console.warn($scope.dname + "You need jquery");
		}
		if (!window.Me || !window.Me.validate) {
			isValid = false;
			console.warn($scope.dname + "You need ValidateMe (https://github.com/QuatreCentQuatre/validateMe/)");
		}

		delete this;
		return isValid;
	};

	/**
	 *
	 * __validateOptions
	 * Will check if you got all the required options needed to use that plugins
	 *
	 * @return  boolean
	 * @access  public
	 *
	 */
	p.__validateOptions = function() {
		var isValid = true;
		if (!$scope.$form.length > 0) {
			isValid = false;
			console.warn($scope.dname + "Couldn't find associated form ", $scope.$form);
		}

		if (isValid && !$scope.$form.attr('method')) {
			isValid = false;
			console.warn($scope.dname + "You need to add method to your form ", $scope.$form.attr('method'));
		}

		if (isValid && $scope.$form.hasClass('skinMe') && (!window.Me || !Me.skin)) {
			isValid = false;
			console.warn($scope.dname + "You need skinMe if you wanna enabled that option (https://github.com/QuatreCentQuatre/skinMe/)");
		}

		if (isValid && $scope.$form.attr('me:validate:analytics') && (!window.Me || !Me.track)) {
			isValid = false;
			console.warn($scope.dname + "if you want autotracking enabled you need trackMe (https://github.com/QuatreCentQuatre/trackMe/)");
		}

		delete this;
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
	p.setOptions = function(options) {
		var settings = Me.help.extend({}, defaults);
		settings = Me.help.extend(settings, options);
		$.each(settings, function(index, value) {
			if ($.inArray(index, overwriteKeys) != -1) {
				$scope[index] = value;
				delete settings[index];
			}
		});
		$scope.options = settings;
		return $scope;
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
	p.getOptions = function() {
		return $scope.options;
	};

	/**
	 *
	 * setVariables
	 * it will set all basic variables from the plugins
	 *
	 * @return  object scope
	 * @access  public
	 *
	 */
	p.setVariables = function() {
		if ($scope.debug) {console.info($scope.dname, "setVariables");}
		$scope.tracker_name   = ($scope.$form.attr('me\\:validate\\:analytics')) ? $scope.$form.attr('me\\:validate\\:analytics') : null;

		$scope.$messages      = ($scope.$messages) ? $scope.$messages : ($scope.$form.find('.form-messages').length > 0) ? $scope.$form.find('.form-messages') : null;
		$scope.$btn           = ($scope.$btn) ? $scope.$btn : ($scope.$form.find('.btn-submit').length > 0) ? $scope.$form.find('.btn-submit') : null;

		$scope.ajax           = (!$scope.$form.attr('ajax')) ? $scope.ajax : ($scope.$form.attr('ajax') == "true");
		$scope.type           = $scope.$form.attr('method');
		$scope.action         = ($scope.$form.attr('action')) ? $scope.$form.attr('action') : $scope.action;
		$scope.skinMe_enabled = $scope.$form.hasClass('skinMe');

		return $scope;
	};

	/**
	 *
	 * initForm
	 * set the basics of formMe
	 *
	 * @return  object scope
	 * @access  public
	 *
	 */
	p.initForm = function() {
		if ($scope.debug) {console.info($scope.dname, "initForm");}
		if ($scope.skinMe_enabled) {$scope.skinMe = new Me.skin($scope.$form);}
		$scope.validation = new Me.validate($scope.$form, {scope:$scope, debug:$scope.debug, onError:$scope.onValidationError, onSuccess:$scope.onValidationSuccess});

		$.each($scope.fields, function(index, field) {$scope.addField(field);});

		if ($scope.$btn) {$scope.$btn.on('click.formMe', Me.help.proxy($scope.clickSubmitHandler, $scope));}
		$scope.$form.on('submit.formMe', Me.help.proxy($scope.submitHandler, $scope));

		return $scope;
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
	p.addField = function(field) {
		if ($scope.debug) {console.info($scope.dname, "addField");}
		$scope.validation.addField(field);
		return $scope;
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
	p.removeField = function(name) {
		if ($scope.debug) {console.info($scope.dname, "removeField");}
		var fieldIndex    = null;
		var fieldToRemove = null;
		$.each($scope.fields, function(index, value) {
			if(name == value.name) {
				fieldToRemove = value;
				fieldIndex    = index;
			}
		});

		if (fieldToRemove) {
			$scope.fields.splice(fieldIndex, 1);
			$scope.validation.removeField(fieldToRemove);
		}
		return $scope;
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
	p.clickSubmitHandler = function(e) {
		if ($scope.debug) {console.info($scope.dname, "clickSubmitHandler");}
		e.preventDefault();
		$scope.$form.submit();
	};

	/**
	 *
	 * clickSubmitHandler
	 * handle the $form submit
	 *
	 * @param   e event
	 * @return  boolean (if not ajax) || void (if ajax)
	 * @access  public
	 *
	 */
	p.submitHandler = function(e) {
		if ($scope.debug) {console.info($scope.dname, "submitHandler");}
		if ($scope.ajax) {
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
	 * onValidationError
	 * handle the $form submit
	 *
	 * @param   fields array
	 * @param   errorFields array
	 * @return  object scope
	 * @access  public
	 *
	 */
	p.onValidationError = function(fields, errorFields) {
		if ($scope.debug) {console.info($scope.dname, "onValidationError");}
		var field = null;
		for (var fieldKey = 0; fieldKey < fields.length; fieldKey++) {
			field = fields[fieldKey];
			$scope.handleValidationSuccessField(field);
		}

		var emptyField = false;
		for (var errorFieldKey = 0; errorFieldKey < errorFields.length; errorFieldKey++) {
			field = errorFields[errorFieldKey];
			$scope.handleValidationErrorField(field);
			if (field.$el.val() == field.$el[0].defautValue || field.$el.val() == field.placeholder || field.$el.val() == field.error) {
				emptyField = true;
			}
		}

		if ($scope.$messages) {
			$scope.$messages.find('.error').addClass('hide');
			if (emptyField) {
				$scope.$messages.find('.error-empty').removeClass('hide');
			} else {
				$scope.$messages.find('.error-validation').removeClass('hide');
			}
		}

		if ($scope.tracker_name) {$scope.trackingMessages.onValidationErreur();}
		return $scope;
	};

	p.onValidationSuccess = function(fields) {
		if ($scope.debug) {console.info($scope.dname, "onValidationSuccess");}
		var field;
		for (var fieldKey = 0; fieldKey < fields.length; fieldKey++) {
			field = fields[fieldKey];
			$scope.handleValidationSuccessField(field);
		}

		if ($scope.$messages) {
			$scope.$messages.find('.error').addClass('hide');
			$scope.$messages.find('.error-none').removeClass('hide');
		}

		if ($scope.tracker_name) {$scope.trackingMessages.onValidationSuccess();}
		console.log($scope);
		if ($scope.ajax) {$scope.formSend(privatesMethods.reformatFormData.call($scope, $scope.$form.serializeArray()));}
		return $scope;
	};

	p.handleValidationSuccessField = function(field) {
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

	p.handleValidationErrorField = function(field) {
		if ($scope.debug) {console.info($scope.dname, "handleValidationErrorField", field);}
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

	p.formSend = function(data) {
		if ($scope.debug) {console.info($scope.dname, "formSend");}
		if($scope.antiSpam) {return;}
		$scope.antiSpam = true;

		$.ajax({
			method: $scope.type,
			url: $scope.action,
			data: data,
			type: 'json',
			dataType: 'json',
			success: Me.help.proxy($scope.ajaxSuccess, $scope),
			error: Me.help.proxy($scope.ajaxError, $scope)
		});
	};

	p.ajaxSuccess = function(data) {
		if ($scope.debug) {console.info($scope.dname, "ajaxSuccess");}
		$scope.onAllSuccess.call($scope, data);
		$scope.onSuccess.call($scope.form_scope, data);
		$scope.antiSpam = false;
		if (data.response && data.response.success == 1) {
			if ($scope.tracker_name) {$scope.trackingMessages.onAjaxSendSuccess();}
		}
	};

	p.onAllSuccess = function(data) {
		if ($scope.debug) {console.info($scope.dname, "onAllSuccess");}
		if (data.response && data.response.success == 1) {
			$scope.validation.reset();
		}
	};

	p.onSuccess = function(data) {
		if ($scope.debug) {console.info($scope.dname, "onSuccess");}
		console.log(data);
	};

	p.ajaxError = function(error) {
		if ($scope.debug) {console.info($scope.dname, "ajaxError");}
		$scope.onAllError.call($scope, error);
		$scope.onError.call($scope.form_scope, error);
		$scope.antiSpam = false;
		if ($scope.tracker_name) {$scope.trackingMessages.onAjaxSendError();}
	};

	p.onAllError = function(error) {
		if ($scope.debug) {console.info($scope.dname, "onAllError");}

	};

	p.onError = function(error) {
		if ($scope.debug) {console.info($scope.dname, "onError");}
		console.log(error);
	};

	p.toString = function(){
		return "[" + $scope.name + "]";
	};

	/* Create Me reference if does'nt exist */
	if(!window.Me){window.Me = {};}
	window.Me.form = FormMe;
}(jQuery, window, document));
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
 * FormMe 2.0.0 (https://github.com/QuatreCentQuatre/formMe/)
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
var FormManager = /*#__PURE__*/function () {
  function FormManager(options) {
    _classCallCheck(this, FormManager);

    this.name = "FormManager";
    this.defaults = {};
    this.forms = [];
    this.options = {};
    this.setOptions(options);
  }

  _createClass(FormManager, [{
    key: "setOptions",
    value: function setOptions(options) {
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

  }, {
    key: "initForms",
    value: function initForms() {
      var $rootElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $('html');
      this.clearForms();
      var forms = $rootElement.find('[me\\:form]');
      var newForms = [];

      for (var i = 0; i < forms.length; i++) {
        var $form = $(forms[i]);
        var formName = $form.attr('me:form');
        var formParams = {
          el: $form[0],
          name: formName,
          params: {}
        };
        /* Look if the form is valid */

        if (typeof Me.forms[formName] !== "function") {
          console.warn("You need to have form that exist.", formName);
          continue;
        }
        /* Look if the form has already been rendered */


        if ($form.attr('me:form:render')) {
          continue;
        }

        $form.attr('me:form:render', "true");
        /* Add data to form */
        // let formData = $form.attr('me:form:data');
        // formParams.params.data = (formData) ? JSON.parse(formData) : {};

        /* Create instance of the form */

        var form = new Me.forms[formName](formParams);
        /* Keep reference of the global form in this class */

        this.forms.push(form);
        /* Assign the form in an array to initialize them later */

        newForms.push(form);
      }
      /* Initialize all new forms*/


      for (var j = 0; j < newForms.length; j++) {
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

  }, {
    key: "clearForms",
    value: function clearForms() {
      var activeForms = [];

      for (var i in this.forms) {
        var form = this.forms[i];

        if (_typeof(form.$el) == "object") {
          var selector = $('html').find(form.$el[0]);

          if (selector.length > 0) {
            activeForms.push(form);
          } else {
            form.terminate();
          }
        }
      }

      this.forms = activeForms;
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    },
    set: function set(name) {
      this._name = name;
    }
  }]);

  return FormManager;
}();

if (!window.Me) {
  window.Me = {};
}

Me.formManager = new FormManager();
Me.forms = [];
$(document).ready(function () {
  Me.formManager.initForms();
});

var FormBase = /*#__PURE__*/function () {
  function FormBase(options) {
    _classCallCheck(this, FormBase);

    this.classes = {
      valid: 'is-valid',
      invalid: 'is-invalid',
      error: 'has-error',
      serverError: 'has-server-error',
      serverSuccess: 'has-server-success'
    };
    this.el = options.el;
    this.$el = $(options.el);
    this.params = options.params ? options.params : {};
    this.$submit = this.$el.find('[me\\:form\\:submit]').length > 0 ? this.$el.find('[me\\:form\\:submit]') : this.$el.find('[type="submit"]');
    this.name = options.name ? options.name : 'FormBasic';
    this.fields = [];
    this.ajax = !!this.$el.attr('ajax');
    this.method = this.$el.attr('method');
    this.action = this.$el.attr('action');
    this.dataType = 'json';
    this.antiSpam = false;
    this.initialized = false;
    this.options = {
      debug: window.SETTINGS && SETTINGS.DEBUG_MODE ? SETTINGS.DEBUG_MODE : false
    };
  }

  _createClass(FormBase, [{
    key: "initialize",
    value: function initialize() {
      var _this = this;

      if (!this.dependenciesExist() || !this.requirementsExit()) return;
      this.validation = new ValidateMe(this);
      this.fields.forEach(function (field, index) {
        _this.addField(field);
      });
      this.addEvents();
      this.initialized = true;
    }
  }, {
    key: "addEvents",
    value: function addEvents() {
      var _this2 = this;

      if (this.$submit) {
        this.$submit.on('click.formMe', function (e) {
          _this2.submitHandler(e);
        });
      }

      this.$el.on('submit.formMe', function (e) {
        _this2.submitHandler(e);
      });
    }
  }, {
    key: "removeEvents",
    value: function removeEvents() {
      if (this.$submit) {
        this.$submit.off('click.formMe');
      }

      this.$el.off('submit.formMe');
    }
  }, {
    key: "addField",
    value: function addField(field) {
      if (!!this.getField(field)) {
        this.fields.push(field);
      } else {
        if (this.initialized) {
          console.warn('This field already exist', field);
        }
      }

      this.validation.addField(field);
    }
  }, {
    key: "removeField",
    value: function removeField(name) {
      var field = this.getField(name);

      if (field) {
        this.fields.splice(index, 1);
        this.validation.removeField(field);
      }
    }
  }, {
    key: "getField",
    value: function getField(name) {
      return this.fields.find(function (el) {
        return el.name === name;
      });
    }
  }, {
    key: "submitHandler",
    value: function submitHandler(e) {
      if (this.antiSpam) {
        return;
      }

      this.antiSpam = true;

      if (this.ajax && e) {
        e.preventDefault();
      }

      if (!this.validation.validate()) {
        e.preventDefault();
      }
    }
  }, {
    key: "onValidationSuccess",
    value: function onValidationSuccess(fields) {
      var _this3 = this;

      fields.forEach(function (field, index) {
        _this3.handleValidationSuccessField(field);
      });
      this.$el.removeClass(this.classes.invalid).addClass(this.classes.valid);

      if (this.ajax) {
        this.handleAjaxSend(this.formatFormData(this.$el.serializeArray()));
      }
    }
  }, {
    key: "onValidationError",
    value: function onValidationError(fields, errorFields) {
      var _this4 = this;

      fields.forEach(function (field, index) {
        _this4.handleValidationSuccessField(field);
      });
      errorFields.forEach(function (field, index) {
        _this4.handleValidationErrorField(field);
      });
      this.$el.addClass(this.classes.invalid);
      this.antiSpam = false;
    }
  }, {
    key: "handleValidationSuccessField",
    value: function handleValidationSuccessField(field) {
      //hide previously visible errors from a past validation
      if (field.error) {
        field.error.addClass('hide').attr('aria-hidden', true);
      }

      field.$el.removeClass(this.classes.error);
    }
  }, {
    key: "handleValidationErrorField",
    value: function handleValidationErrorField(field) {
      if (field.error) {
        field.error.removeClass('hide').attr('aria-hidden', false);
      }

      field.$el.addClass(this.classes.error);
    }
  }, {
    key: "handleAjaxSend",
    value: function handleAjaxSend(formData) {
      var _this5 = this;

      $.ajax({
        method: this.method,
        url: this.action,
        data: formData,
        dataType: this.dataType,
        processData: false,
        cache: false,
        contentType: false,
        success: function success(successObj) {
          _this5.ajaxSuccess(successObj);
        },
        error: function error(errorObj) {
          _this5.ajaxError(errorObj);
        },
        complete: function complete() {
          _this5.ajaxComplete();
        }
      });
    }
  }, {
    key: "ajaxSuccess",
    value: function ajaxSuccess(data) {
      if (this.dataType === 'json' && Object.entries(data).length === 0) {
        console.warn('No values returned by the service.');
      }

      this.reset();
      this.$el.removeClass(this.classes.serverError).addClass(this.classes.serverSuccess);
    }
  }, {
    key: "ajaxError",
    value: function ajaxError(error) {
      this.$el.removeClass(this.classes.serverSuccess).addClass(this.classes.serverError);
    }
  }, {
    key: "ajaxComplete",
    value: function ajaxComplete() {
      this.antiSpam = false;
    }
  }, {
    key: "formatFormData",
    value: function formatFormData(data) {
      var formattedData = new FormData();
      data.forEach(function (item, index) {
        var field = $("[name=\"".concat(item.name, "\"]"));

        if (item.value === "" || field.disabled) {
          return;
        }

        formattedData.append(item.name, item.value);
      }); //@note serializeArray does not serialize file select elements.

      this.fields.forEach(function (item, index) {
        if (item.file_type != undefined) {
          var field = $("[name=\"".concat(item.name, "\"]"));

          if (field[0].files[0]) {
            var filesArr = [];

            for (var prop in field[0].files) {
              if (field[0].files[prop].name && field[0].files[prop].size) {
                filesArr.push(field[0].files[prop]);
              }
            }

            formattedData.append(item.name, filesArr);
          }
        }
      });
      return formattedData;
    }
  }, {
    key: "dependenciesExist",
    value: function dependenciesExist() {
      var isValid = true;

      if (!window.$) {
        isValid = false;
        console.error("Form ".concat(this.name, " needs Jquery."));
      }

      if (!window.Me || !window.Me.validate) {
        isValid = false;
        console.error("Form ".concat(this.name, " needs ValidateMe (https://github.com/QuatreCentQuatre/validateMe/)"));
      }

      return isValid;
    }
  }, {
    key: "requirementsExit",
    value: function requirementsExit() {
      var isValid = true;

      if (!this.$el.length > 0) {
        isValid = false;
        console.error("Couldn't find associated form name", this.name);
      }

      if (!this.method) {
        isValid = false;
        console.error("".concat(this.name, " needs to have a method"));
      }

      if (!this.action) {
        isValid = false;
        console.error("".concat(this.name, " needs to have an action attribute"));
      }

      if (!this.fields || this.fields && this.fields.length <= 0) {
        console.error("".concat(this.name, " needs a list of fields. To see what you need to add go check de README.md"));
        return;
      }

      if (!this.$submit.length > 0) {
        isValid = false;
        console.error("".concat(this.name, " needs to have a submit button"));
      }

      return isValid;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.validation.reset();
      return this;
    }
  }, {
    key: "terminate",
    value: function terminate() {
      this.removeEvents();
    }
  }, {
    key: "name",
    set: function set(name) {
      if (typeof name !== "string") {
        console.error('The name parameter must be a string');
        return;
      }

      this._name = name;
    },
    get: function get() {
      return this._name;
    }
  }, {
    key: "dataType",
    set: function set(dataType) {
      if (typeof dataType !== "string") {
        console.error('The dataType parameter must be a string');
        return;
      }

      this._dataType = dataType;
    },
    get: function get() {
      return this._dataType;
    }
  }, {
    key: "ajax",
    set: function set(bool) {
      if (typeof bool !== "boolean") {
        console.error('The bool parameter must be a boolean');
        return;
      }

      this._ajax = bool;
    },
    get: function get() {
      return this._ajax;
    }
  }, {
    key: "method",
    set: function set(method) {
      if (typeof method !== "string") {
        console.error('The method parameter must be a string');
        return;
      }

      this._method = method;
    },
    get: function get() {
      return this._method;
    }
  }, {
    key: "action",
    set: function set(action) {
      if (typeof action !== "string") {
        console.error('The method parameter must be a string');
        return;
      }

      this._action = action;
    },
    get: function get() {
      return this._action;
    }
  }, {
    key: "antiSpam",
    set: function set(bool) {
      if (typeof bool !== "boolean") {
        console.error('The bool parameter must be a boolean');
        return;
      }

      this._antiSpam = bool;
    },
    get: function get() {
      return this._antiSpam;
    }
  }, {
    key: "fields",
    set: function set(fields) {
      if (_typeof(fields) !== "object" && fields.length > 0) {
        console.error('The fields parameter must be an array');
        return;
      }

      this._fields = fields;
    },
    get: function get() {
      return this._fields;
    }
  }, {
    key: "initialized",
    set: function set(bool) {
      this._initialized = bool;
    },
    get: function get() {
      return this._initialized;
    }
  }]);

  return FormBase;
}();

Me.forms['FormBase'] = FormBase;
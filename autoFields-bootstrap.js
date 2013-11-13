angular.module('autoFields', ['ui.bootstrap'])
.directive('autoFields', ['$compile', function ($compile, $rootScope) {
	return {
		restrict: 'E',
		priority: 1,
		replace: true,
		compile: function () {
			return function ($scope, $element, $attr) {
				var schemaStr = $attr.fields || $attr.autoFields,
					optionsStr = $attr.options,
					dataStr = $attr.data,
					container = null;

				var options = {
					classes: {
						formGroup: 'form-group',
						input: 'form-control',
						col: 'col-sm-'
					},
					container: '<div class="autoFields" ng-form name="autoFields"></div>',
					defaultOption: 'Select One',
					dateSettings: {
						showWeeks: false
					},
					textareaRows: 3,
					fixUrl: true
				};
				$scope.dateSettings = options.dateSettings;
				if ($scope.tabIndex == null) $scope.tabIndex = 1;

				var getField = function (field, index) {
					var fieldEl = '<div class="' + options.classes.formGroup + ' ' + field.type + '">';
					switch (field.type) {
						case 'checkbox':
							fieldEl += checkbox(field, index);
							break;
						case 'multiple':
							fieldEl += row(field, index);
							break;
						case 'date':
							fieldEl += label(field);
							fieldEl += date(field, index);
							break;
						case 'select':
							fieldEl += label(field);
							fieldEl += select(field, index);
							break;
						case 'textarea':
							fieldEl += label(field);
							fieldEl += textarea(field, index);
							break;
						default:
							fieldEl += label(field);
							fieldEl += textInput(field, index);
							break;
					}
					fieldEl += '</div>';

					return fieldEl;
				};

				var labelText = function (field) {
					return (field.label || CamelToTitle(field.property));
				}

				var label = function (field) {
					return '<label for="' + field.property + '">' + labelText(field) + '</label>';
				};

				var row = function (field, index) {
					var row = '<div class="row">';
					var cells = [];
					var normalSchemaStr = angular.copy(schemaStr);
					schemaStr += '[' + index + '].fields';
					angular.forEach(field.fields, function (cell, cellIndex) {
						var cellHtml = '<div class="' + options.classes.col + (cell.columns || field.columns) + '">';
						cellHtml += getField(cell, cellIndex)
						cellHtml += '</div>';
						cells.push(cellHtml);
					});
					schemaStr = normalSchemaStr;
					row += cells.join(' ') + '</div>';
					return row;
				}

				var checkbox = function (field, index) {
					var checkbox = '<label> <input type="checkbox"' + commonAttributes(field, index) + attributes(field.attr) + '/> ' + labelText(field) + '</label>';
					return checkbox;
				}

				var date = function (field, index) {
					return '<input type="text" show-weeks="dateSettings.showWeeks" datepicker-popup="MMMM dd, yyyy"' + commonAttributes(field, index) + attributes(field, index) + ' />';
				}

				var commonAttributes = function (field, index) {
					var attr = ' id="' + field.property + '" tabindex="' + $scope.tabIndex + '" name="' + field.property + '" ng-model="' + (field.value ? 'autoForm' + schemaStr.replace(/(\[|\])/g, "_") + index + '.model' : dataStr + "['" + field.property + "']") + '" placeholder="' + (field.placeholder ? field.placeholder : labelText(field)) + '" ';
					if (field.value != null) attr += 'value-function="' + schemaStr + '[' + index + '].value"';
					if (field.type != 'checkbox') attr += 'class="' + options.classes.input + ' ' + field.type + '" ';
					$scope.tabIndex++;
					return attr;
				}

				var select = function (field, index) {
					var select = '<select ng-options="' + field.list + '"';
					select += commonAttributes(field, index);
					if (field.attr != null) select += attributes(field.attr);
					select += '>';
					select += '<option value="">' + (field.defaultOption ? field.defaultOption : options.defaultOption) + '</option>';
					select += '</select>';
					return select;
				}

				var textarea = function (field, index) {
					var textarea = '<textarea rows="' + (field.rows ? field.rows : options.textareaRows) + '"';
					textarea += commonAttributes(field, index);
					if (field.attr != null) textarea += attributes(field.attr);
					textarea += '></textarea>';
					return textarea;
				};

				var textInput = function (field, index) {
					var input = '<input type="' + field.type + '"';
					input += commonAttributes(field, index);
					if (field.attr != null) input += attributes(field.attr);
					if (field.type == 'url' && (field.fixUrl == true || options.fixUrl == true)) input += 'fix-url';
					input += '></input>';
					return input;
				};

				var attributes = function (attributes, index) {
					var htmlAttr = [];
					angular.forEach(attributes, function (value, name) {
						var attr = CamelToDash(name) + '="' + value + '"';
						htmlAttr.push(attr);
					});
					return htmlAttr.join(' ');
				};

				var formScope = null
				$scope.$watch(schemaStr, function (schema) {
					//rebuild form
					container.html('');
					angular.forEach(schema, function (field, index) {
						container.append(getField(field, index));
					});

					if (formScope != null) formScope.$destroy();
					formScope = $scope.$new();
					formScope.data = $scope[dataStr];
					formScope.fields = schema;
					$compile(container)(formScope);
				}, true);

				$scope.$watch(optionsStr, function (newOptions) {
					angular.copy(options, newOptions);
				}, true);

				container = angular.element(options.container)
				$element.replaceWith(container);

				//Helper Functions
				var CamelToTitle = function (str) {
					return str
					.replace(/([A-Z])/g, ' $1')
					.replace(/^./, function (str) { return str.toUpperCase(); });
				};
				var CamelToDash = function (str) {
					return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
				}
			}
		}
	}
}])
.directive('fixUrl', [function () {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, element, attr, ngModel) {
			var urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.\-\?\=\&]*)$/i;

			//Render formatters on blur...
			var render = function () {
				var viewValue = ngModel.$modelValue;
				if (viewValue == null) return;
				for (var i in ngModel.$formatters) {
					viewValue = ngModel.$formatters[i](viewValue);
				}
				ngModel.$viewValue = viewValue;
				ngModel.$render();
			};
			element.bind('blur', render);

			var formatUrl = function (value) {
				var test = urlRegex.test(value);
				if (test) {
					var matches = value.match(urlRegex);
					var reformatted = (matches[1] != null && matches[1] != '') ? matches[1] : 'http://';
					reformatted += matches[2] + '.' + matches[3];
					if (typeof matches[4] != "undefined") reformatted += matches[4]
					value = reformatted;
				}
				return value;
			}
			ngModel.$formatters.push(formatUrl);
			ngModel.$parsers.unshift(formatUrl);
		}
	};
}])
.directive('valueFunction', [function () {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, element, attr, ngModel) {
			var valueFn = scope.$eval(attr.valueFunction);

			scope.$watch(attr.valueFunction + '()', function (value) { //ToUser
				if (value != null) {
					scope.$eval(attr.ngModel + '=' + attr.valueFunction + '()');
				}
			});

			var updateFunction = function (dontApply) {
				valueFn(scope.$eval(attr.ngModel));
				if (dontApply !== true) { scope.$apply(); }
			};

			//Update on change
			scope.$watch(attr.ngModel, function () {
				if (updateFunction != null) { updateFunction(true); }
			});
		}
	};
}])
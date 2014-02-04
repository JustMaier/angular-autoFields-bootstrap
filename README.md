angular-autoFields-bootstrap
=============================

Avoid bloating your templates with repetitive form html.  
Instead, just specify a schema for the form and the model you want to bind it to and you're done!

[**Check out a demo!**](http://justmaier.github.io/angular-autoFields-bootstrap/#demo)

##Installation

####Bower
`bower install angular-autoFields-bootstrap`

####Nuget
`install-package AngularJs.AutoFields.Bootstrap`

####Manually
`<script type="text/javascript" src="js/autoFields-bootstrap.js"></script>`

##Usage

0. If you're doing this manually, be sure to install [Angular-UI Bootstrap](https://github.com/angular-ui/bootstrap) for date popover support
1. Include the `autoFields-bootstrap.js` script provided by this component into your app
2. add `autoFields` as a module dependency to your app

####Javascript
```javascript
angular.module('app',['autoFields'])
.controller('JoinCtrl', ['$scope', function ($scope) {
	$scope.user = {
		username: '',
		password: '',
		confirmPassword: '',
	};

	$scope.schema = [
		{ property: 'username', type: 'text', attr: { ngMinlength: 4, required: true }, msgs: {minlength: 'Needs to have at least 4 characters'} },
		{ property: 'password', type: 'password', attr: { required: true } },
		{ property: 'confirmPassword', label: 'Confirm Password', type: 'password', attr: { confirmPassword: 'user.password', required: true } }
	];

	$scope.join = function(){
		if(!$scope.joinForm.$valid) return;
		//join stuff....
	}
}]);
```

####Html
```html
 <form name="joinForm" ng-submit="join()">
    <auto:fields fields="schema" data="user"></auto:fields>
    <button type="submit" class="btn btn-default btn-lg btn-block" ng-class="{'btn-primary':joinForm.$valid}" tabindex="100">Join</button>
</form>
```

##Field Schema

* `property` the data property to bind to
* `type` the type of field. Options include: checkbox, date, select, textarea, any text variation (ie. password, text, email, number)
* `label` the label for the field. If no label is provided it will convert the property name to title case. If you don't want a label, set it's value to ''
* `attr` any additional attributes you would like to have on the object. Camelcase is converted to dash notation. Validation properties can go here.
* `list` the string that goes into ng-options for select fields
* `rows` number of textarea rows (defaults to 3)
* `columns` number of sm columns a field should span if the type is multiple. If this is applied at the same level as the multiple type, it will apply it to all of it's fields.
* `msgs` validation messages for corresponding validation properties on the field

##Options

* `classes` the classes for the different elements
* `container` the html for the div the will hold the fields
* `defaultOption` the text for the default select option (Select One)
* `dateSettings` settings for the date fields ([see angular-ui-bootstrap's date picker](http://angular-ui.github.io/bootstrap/#/datepicker))
* `textareaRows` the default amount of rows for a textarea (3)
* `fixUrl` whether or not url type fields should have http:// auto added (true)
* `validation` settings for validation
	* `enabled` enabled/disable validation (enabled by default)
	* `showMessages` enabled/disable validation messages (enabled by default)
	* `defaultMsgs` default validation messages when none is specified in the field schema

##Notes
* It shares the scope of it's parent so that it can access the data on the scope
* If you would like to add another type of field or you run into any bugs, please submit a pull request!
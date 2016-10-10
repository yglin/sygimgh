'use strict';

/**
 * @ngdoc overview
 * @name sygimghApp
 * @description
 * # sygimghApp
 *
 * Main module of the application.
 */
angular
	.module('sygimghApp', [
		'ngAnimate',
		'ngAria',
		'ngCookies',
		'ngMessages',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'ngMaterial',
		'ngLodash',
		'ngFileSaver',
		'angular-uuid'
	])
	.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				template: '<sygimgh></sygimgh>',
			})
			.otherwise({
				redirectTo: '/'
			});
	});

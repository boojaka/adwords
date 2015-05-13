'use strict';

/**
 * @ngdoc function
 * @name adwordsApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the adwordsApp
 */
angular.module('adwordsApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

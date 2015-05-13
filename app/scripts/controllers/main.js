'use strict';

/**
 * @ngdoc function
 * @name adwordsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the adwordsApp
 */
angular.module('adwordsApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

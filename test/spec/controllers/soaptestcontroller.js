'use strict';

describe('Controller: SoaptestcontrollerCtrl', function () {

  // load the controller's module
  beforeEach(module('adwordsApp'));

  var SoaptestcontrollerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SoaptestcontrollerCtrl = $controller('SoaptestcontrollerCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});

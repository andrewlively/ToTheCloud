/*global angular, jQuery */
var login = angular.module('login', ['oitozero.ngSweetAlert']);

login.controller('LoginController', function ($scope, $http, SweetAlert) {
    $scope.resetPasswordModel = {
        email: ''
    };

    $scope.signUpModel = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    };

    $scope.showResetPassword = function () {
        $scope.resetPasswordModel = {
            email: ''
        };
    };

    $scope.resetPassword = function () {
        $http.post('/api/user/reset-password', $scope.resetPasswordModel)
            .success(function (data) {
                SweetAlert.swal('Password Reset Request Successful', data.message, 'success');
                jQuery('#resetPasswordModal').modal('hide');
            })
            .error(function (data) {
                SweetAlert.swal('Password Reset Request Error', data.message, 'error');
            });
    };

    $scope.showCreateAccount = function () {
        $scope.signUpModel = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
        };
    };

    $scope.signUp = function () {
        $http.post('/api/user/register', $scope.signUpModel)
            .success(function (data) {
                SweetAlert.swal('Sign Up Successful', data.message, 'success');
                jQuery('#createAccountModal').modal('hide');
            })
            .error(function (data) {
                SweetAlert.swal('Sign Up Error', data.message, 'error');
            });
    };

});
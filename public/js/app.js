/*global angular */
var app = angular.module('cloudApp', ['ui.router']);

app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    //
    // Now set up the states
    $stateProvider
        .state('entityBrowser', {
            url: '/',
            templateUrl: 'partials/entityBrowser.html',
            controller: 'EntityBrowserCtrl'
        })
        .state('settings', {
            url: '/settings',
            templateUrl: 'partials/settings.html',
            controller: 'SettingsCtrl'
        });

    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');
});

app.controller('BaseCtrl', function ($scope, $rootScope) {
    $scope.currentPage = 'entityBrowser';

    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
            $scope.currentPage = toState.name;
        });

});

app.controller('EntityBrowserCtrl', function ($scope, $http) {
    $scope.entities = [];
    $scope.path = '/';

    $scope.newFolder = {
        name: ''
    };

    $scope.newFileDump = {
        name: '',
        isPublic: false,
        isProtected: false,
        requiresAccount: false
    };

    $http({
        url: '/api/entities',
        method: "GET",
        params: {
            path: $scope.path
        }
    })
        .success(function (data) {
            $scope.entities = data;
        })
        .error(function (data) {

        });

    $scope.share = function (entity) {

    };

    $scope.delete = function (entity) {

    };
    
    $scope.openFolder = function (entity) {
        if (entity.type === 'folder') {
            console.log(entity);
        }
    };

    $scope.resetNewFolder = function () {
        $scope.newFolder.name = '';
    };

    $scope.resetNewFileDump = function () {
        $scope.newFileDump.name = '';
        $scope.newFileDump.isPublic = false;
        $scope.newFileDump.isProtected = false;
        $scope.newFileDump.requiresAccount = false;
    };

    $scope.createNewFolder = function () {
        $http.post('/api/folder/new', {
            folder: $scope.newFolder
        })
            .success(function (d) {
                $scope.entities.push(d.newFolder);
            })
            .error(function (d) {
                // TODO: Handle error
            });

    };

});

app.controller('SettingsCtrl', function ($scope) {

});
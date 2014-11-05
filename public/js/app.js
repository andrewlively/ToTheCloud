/*global angular, _ */
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
    $scope.path = '';
    $scope.currentDirectory = null;
    $scope.directories = [];
    
    $scope.filePreview = {
        name: '',
        url: '',
        type: ''
    };

    $scope.newFolder = {
        name: ''
    };

    $scope.newFileDump = {
        name: '',
        isPublic: false,
        isProtected: false,
        requiresAccount: false
    };

    $scope.share = function (entity) {

    };

    $scope.delete = function (entity) {
        var url = null;

        if (entity.type === 'file') {
            url = '/api/file/delete';
        } else if (entity.type === 'folder') {
            url = '/api/folder/delete';
        }

        if (url) {
            $http.post(url, {
                file: entity.key
            })
                .success(function (data) {
                    // Remove the file from the view
                    $scope.entities = $scope.entities.filter(function (obj) {
                        return obj._id !== entity._id;
                    });
                })
                .error(function (data) {
                    // Display the error
                    // TODO: Find something better than an alert
                    alert('There was an error deleting the entity');
                });
        }
    };

    $scope.open = function (entity) {
        if (entity.type === 'folder') {
            $scope.directories.push(entity);
            $scope.currentDirectory = entity;
            getEntitiesForParent(entity._id);
            $scope.path += ($scope.path.length === 0 ? '' : '/') + entity.name;
        } else if (entity.type === 'file') {
            var fileType = entity.name.slice(entity.name.lastIndexOf('.') + 1).toLocaleLowerCase();
            var imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'mpb'];
            var movieTypes = ['mp4', 'mov', 'flv'];
            var audioTypes = ['mp3'];
            var docTypes = ['doc', 'docx', 'txt'];
            
            if (imageTypes.indexOf(fileType) > -1) {
                $scope.filePreview.type = 'image';
            } else if (movieTypes.indexOf(fileType)) {
                $scope.filePreview.type = 'movie';
            } else if (audioTypes.indexOf(fileType)) {
                $scope.filePreview.type = 'audio';
            } else if (docTypes.indexOf(fileType)) {
                $scope.filePreview.type = 'doc';
            }
            
            $scope.filePreview.name = entity.name;
            $scope.filePreview.url = '/download/' + entity.key;
            
            jQuery('#filePreviewModal').modal('show');
            
        }
    };

    $scope.goUpDirectory = function () {
        $scope.directories.pop();
        if ($scope.directories.length > 0) {
            $scope.currentDirectory = _.last($scope.directories);
            getEntitiesForParent($scope.currentDirectory._id);
            var paths = $scope.path.split('/');
            paths.pop();
            $scope.path = paths.join('/');
        } else {
            $scope.currentDirectory = null;
            $scope.path = '';
            getEntitiesForParent(null);
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
        var parent = null;

        if ($scope.currentDirectory) {
            parent = $scope.currentDirectory._id;
        }

        $http.post('/api/folder/new', {
            folder: $scope.newFolder,
            parent: parent
        })
            .success(function (d) {
                $scope.entities.push(d.newFolder);
                jQuery('#createFolderModal').modal('hide');
            })
            .error(function (d) {
                alert('There was an error creating the folder');
            });

    };

    function getEntitiesForParent(parent) {
        $http({
            url: '/api/entities',
            method: 'GET',
            params: {
                parent: parent
            }
        })
            .success(function (data) {
                $scope.entities = data;
            })
            .error(function (data) {

            });
    }

    getEntitiesForParent(null);

});

app.controller('SettingsCtrl', function ($scope) {

});
/*global angular, _, async, jQuery */
var app = angular.module('cloudApp', ['ui.router', 'ngSanitize', 'com.2fdevs.videogular', 'cgBusy', 'oitozero.ngSweetAlert', 'angularFileUpload']);

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

app.controller('EntityBrowserCtrl', function ($scope, $http, SweetAlert, $upload) {
    $scope.entities = [];
    $scope.path = '';
    $scope.tableMessage = '';
    $scope.tablePromise = null;
    $scope.currentDirectory = null;
    $scope.directories = [];
    $scope.videoPlayer = {
        theme: 'http://www.videogular.com/styles/themes/default/videogular.css'
    };
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
        var ent = {};

        SweetAlert.swal({
                title: 'Are you sure you want to delete this ' + entity.type + '?',
                text: 'Once this ' + entity.type + ' is deleted it cannot be restored.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Delete'
            },
            function (shouldDelete) {
                if (shouldDelete) {
                    if (entity.type === 'file') {
                        url = '/api/file/delete';
                        $scope.tableMessage = 'Deleting file...';
                    } else if (entity.type === 'folder') {
                        url = '/api/folder/delete';
                        $scope.tableMessage = 'Deleting folder...';
                    }

                    if (url) {
                        ent[entity.type] = entity._id;
                        $scope.tablePromise = $http.post(url, ent)
                            .success(function (data) {
                                // Remove the file from the view
                                $scope.entities = $scope.entities.filter(function (obj) {
                                    return obj._id !== entity._id;
                                });
                            }).error(function (data) {
                                // Display the error
                                SweetAlert.swal('Delete error', 'There was an error trying to delete the ' + entity.type + '. Please try again.', 'error');
                            });
                    }
                }
            }
        );
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
            var videoTypes = ['mp4', 'mov', 'flv', 'avi'];
            var audioTypes = ['mp3'];
            var docTypes = ['doc', 'docx', 'txt'];

            if (imageTypes.indexOf(fileType) > -1) {
                $scope.filePreview.type = 'image';
            } else if (videoTypes.indexOf(fileType) > -1) {
                $scope.filePreview.type = 'video';
            } else if (audioTypes.indexOf(fileType) > -1) {
                $scope.filePreview.type = 'audio';
            } else if (docTypes.indexOf(fileType) > -1) {
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

    $scope.resetNewFile = function () {
        $scope.fileUploadQueue = [];
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

    $scope.fileUploadQueue = [];

    $scope.onFileSelect = function ($file) {
        //$files: an array of files selected, each file has name, size, and type.

        $scope.fileUploadQueue = $file;

        var uploadedFiles = [];

        var data = {};

        if ($scope.currentDirectory) {
            data.parent = $scope.currentDirectory._id;
        }

        async.eachSeries($scope.fileUploadQueue, function (file, callback) {
            $scope.upload = $upload.upload({
                url: '/api/file/new',
                method: 'POST',
                file: file,
                data: data
            }).progress(function (evt) {
                file.progress = parseInt(100.0 * evt.loaded / evt.total) + '%';
            }).success(function (data) {
                $scope.entities.push(data.entity);
                callback(null);
            }).error(function () {
                file.progress = 'Error';
                callback('Failed to upload file');
            });
        }, function (err) {
            if (err) {
                SweetAlert.swal('File upload error', 'There was an error trying to upload the file. Please try again.', 'error');
            }
        });
    };

    $scope.createNewFolder = function () {
        var parent = null;

        if ($scope.currentDirectory) {
            parent = $scope.currentDirectory._id;
        }

        $http.post('/api/folder/new', {
            folder: $scope.newFolder,
            parent: parent
        }).success(function (d) {
            $scope.entities.push(d.newFolder);
            jQuery('#createFolderModal').modal('hide');
        }).error(function (d) {
            SweetAlert.swal('Create error', 'There was an error trying to create the folder. Please try again.', 'error');
        });

    };

    $scope.entityRename = {
        type: '',
        name: '',
        id: ''
    };

    $scope.openRenameEntity = function (entity) {
        $scope.entityRename = {
            type: entity.type,
            name: entity.name,
            id: entity._id
        };
    };

    $scope.renameEntity = function () {
        $http.post('/api/' + $scope.entityRename.type + '/rename', $scope.entityRename)
            .success(function () {
                // TODO: Rename local copy of entity
            })
            .error(function () {
                // TODO: Present error to the user
            });
    };

    function getEntitiesForParent(parent) {
        $http({
            url: '/api/entities',
            method: 'GET',
            params: {
                parent: parent
            }
        }).success(function (data) {
            $scope.entities = data;
        }).error(function (data) {
            SweetAlert.swal('Fetch error', 'There was an error trying to fetch the entities for this parent. Please try again.', 'error');
        });
    }


    getEntitiesForParent(null);

});

app.controller('SettingsCtrl', function ($scope) {

});
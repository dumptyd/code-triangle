var lcAppProfile = angular.module('lcAppProfile', ['ngTagsInput', 'ui.bootstrap']);
lcAppProfile.controller('profileController', function ($scope, $http, $uibModal, $log) {
  $scope.addProject = function(project) {
    if(!project.fullName) return;
    var index = project.index;
    $http({
      method: 'POST',
      url: '/projects',
      data: {project: project}
    }).success(function(response) {
      $scope.repos[index].inList = !$scope.repos[index].inList
      toastr.success(response.message);
    }).error(function(response) {
      toastr.error('An error occured.');
    });
  };
  $scope.updateProject = function(project) {
    if(!project.fullName) return;
    $http({
      method: 'POST',
      url: '/projects/update',
      data: {project: project}
    }).success(function(response) {
      toastr.success('Updated.');
    }).error(function(response) {
      toastr.error('An error occured.');
    });
  };
  $scope.repos = [];
  $scope.user = {};
  $http({
    url:'/profile/repos',
  }).then(function(response) {
    $scope.repos = response.data.repos;
    $scope.user = response.data.user;
    console.log(response.data.user);
  }, function(err) {
    toastr.error('An error occured.');
  });
  $scope.project = {
    fullName: '',
    name: '',
    description: '',
    tags: [],
    index: -1
  };
  $scope.removeProject = function(fullName) {
    let index = $scope.repos.findIndex(function(e) {
      return e.fullName == fullName;
    });
    let obj = {fullName: $scope.repos[index].fullName, index: index};
    $scope.addProject(obj);
  }
  $scope.showForm = function(fullName) {
    let index = $scope.repos.findIndex(function(e) {
      return e.fullName == fullName;
    });
    $scope.project.fullName = $scope.repos[index].fullName;
    $scope.project.name = $scope.repos[index].name;
    $scope.project.description = $scope.repos[index].description;
    $scope.project.tags = [];
    $scope.project.index = index;
    $scope.project.tags.push({text: $scope.repos[index].language});
    var modalInstance = $uibModal.open({
      templateUrl: '../html/modal.html',
      controller: ModalInstanceCtrl,
      scope: $scope,
      resolve: {
        userForm: function() {
          return $scope.userForm;
        }
      }
    });
  };
  $scope.editProject = function(fullName) {
    let index = $scope.repos.findIndex(function(e) {
      return e.fullName == fullName;
    });
    var fullName = $scope.repos[index].fullName;
    if(!fullName) return;
    $http({
      method: 'GET',
      url: '/projects/get',
      params: {
        fullName: fullName
      }
    }).then(function(response) {
      var project = response.data.project;
      $scope.project.fullName = project.fullName;
      $scope.project.name = project.name;
      $scope.project.description = project.description;
      $scope.project.tags = project.tags;
      $scope.project.index = index;
      var modalInstance = $uibModal.open({
        templateUrl: '../html/modal.html',
        controller: ModalInstanceEditCtrl,
        scope: $scope,
        resolve: {
          userForm: function() {
            return $scope.userForm;
          }
        }
      });

    }, function(err) {
      toastr.error('An error occured.');
    });
  }
});

var ModalInstanceCtrl = function ($scope, $uibModalInstance, userForm) {
  $scope.form = {}
  $scope.submitForm = function () {
    if ($scope.form.userForm.$valid) {
      $scope.addProject($scope.project);
      $uibModalInstance.close('closed');
    }
    else {
      console.log('userform is not in scope');
    }
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
};

var ModalInstanceEditCtrl = function ($scope, $uibModalInstance, userForm) {
  $scope.form = {}
  $scope.submitForm = function () {
    if ($scope.form.userForm.$valid) {
      $scope.updateProject($scope.project);
      $uibModalInstance.close('closed');
    }
    else {
      console.log('userform is not in scope');
    }
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
};
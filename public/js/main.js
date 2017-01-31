var lcAppMain = angular.module('lcAppMain', ['ngTagsInput']);
lcAppMain.controller('indexController', function($scope, $http) {
  $scope.projects = [];
  $scope.filterTags = [];
  $scope.addToFilter = function(text) {
    var index = $scope.filterTags.findIndex(function(e) {
      return text == e.text;
    });
    if(index < 0)
      $scope.filterTags.push({text: text});
  };
  $scope.shuffle = function(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  };
  $http({
    method: 'GET',
    url: '/projects',
  }).success(function(response) {
    console.log(response);
    $scope.projects = response.projects;
  }).error(function(response) {
    
  });
});

lcAppMain.filter('filterByTags', function() {
  return function(items, tags) {
    if(!tags.length) {
      return items;
    }
    var filtered = [];
    (items || []).forEach(function(item) { 
      var matches = tags.some(function(tag) { 
        var index = item.tags.findIndex(function(elem) {
          return elem.toLowerCase() == tag.text.toLowerCase();
        });
        return index > -1;
      });
      if (matches) { 
        filtered.push(item);
      }
    });
    return filtered; // Return the array with items that match any tag
  };
});
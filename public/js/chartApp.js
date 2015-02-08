'use strict';

var app = angular.module('hcChart', ['angularCharts']);

angular.module('hcChart')
  .controller('ChartCtrl', function($scope, $http) {
    $scope.config = {
      tooltips: true,
      labels: false,
      mouseover: function() {},
      mouseout: function() {},
      click: function() {},
      legend: {
        display: true,
        position: 'right'
      }
    };

    $scope.data = {};


    $scope.search = function() {
      $scope.$apply();
      var req = {
        method: 'GET',
        url: '/statistics',
        params: {
          from: $scope.from,
          to: $scope.to
        },
      };
      $http(req).
      success(function(data) {
        $scope.data.data = data;
      });
    };

    $http.get('/statistics').
    success(function(data) {
      $scope.data.data = data;
    });

    $http.get('/countryCodes').
    success(function(countryCodes) {
      var areas = _.map(countryCodes, function(c) {
        return {
          id: c.toUpperCase(),
          showAsSelected: true
        };
      });
      var map = AmCharts.makeChart("mapdiv", {
        type: "map",
        theme: "dark",
        pathToImages: "http://cdn.amcharts.com/lib/3/images/",
        panEventsEnabled: true,
        backgroundColor: "#535364",
        backgroundAlpha: 1,
        zoomControl: {
          panControlEnabled: true,
          zoomControlEnabled: true
        },
        dataProvider: {
          map: "worldHigh",
          getAreasFromMap: true,
          areas: areas
        },
        areasSettings: {
          autoZoom: true,
          color: "#B4B4B7",
          colorSolid: "#84ADE9",
          selectedColor: "#84ADE9",
          outlineColor: "#666666",
          rollOverColor: "#9EC2F7",
          rollOverOutlineColor: "#000000"
        }
      });
    });
  });

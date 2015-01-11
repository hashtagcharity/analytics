'use strict';

angular.module('hcChart', ['angularCharts'])

angular.module('hcChart')
  .controller('ChartCtrl', function ($scope, $http) {
    $scope.config = {
        tooltips: true,
        labels: false,
        mouseover: function () { },
        mouseout: function () { },
        click: function () { },
        legend: {
            display: true,
            position: 'right'
        }
    };

    $scope.data = {};

    
    $scope.search = function () {
        var req = {
            method: 'GET',
            url: '/statistics',
            params: { from: $scope.from, to: $scope.to },
        };
        $http(req).
        success(function (data) {
            $scope.data.data = data;
        });
    };

    $http.get('/statistics').
    success(function (data, status, headers, config) {
        $scope.data.data = data;
    });
})

'use strict';

angular.module('hcChart', ['angularCharts'])

angular.module('hcChart')
  .controller('ChartCtrl', function ($scope, $http) {
    $scope.config = {
        title: 'Subscriptions',
        tooltips: true,
        labels: false,
        mouseover: function () { },
        mouseout: function () { },
        click: function () { },
        legend: {
            display: true,
            //could be 'left, right'
            position: 'right'
        }
    };
    $scope.data = {};
    $http.get('/statistics').
  success(function (data, status, headers, config) {
        debugger;
        $scope.data.data = data;
    });
})
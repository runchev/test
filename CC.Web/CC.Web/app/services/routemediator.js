(function() {
    'use strict';

    var serviceId = 'routemediator';

    // TODO: replace app with your module name
    angular.module('app').factory(serviceId, ['$rootScope', '$location', 'config', 'logger',
        routemediator]);
    var handleChangeRouteError = false;
    function routemediator($rootScope, $location, config, logger) {
        // Define the functions and properties to reveal.
        var service = {
            setRoutingHandlers: setRoutingHandlers
        };

        return service;

        function setRoutingHandlers() {
            updateDocTitle();
            handleRouteErrors();
        }

        function handleRouteErrors() {
            $rootScope.$on('$routeChangeError',
                function (event, current, previous, rejection) {
                    if (handleChangeRouteError) {
                        return;
                    }
                    handleChangeRouteError = true;
                    var msg = 'Error routing ' + (current && current.name);
                    logger.logWarning(msg, current, serviceId, true);
                    $location.path('/');
                });
        }

        function updateDocTitle() {
            $rootScope.$on('$routeChangeSuccess',
                function (event, current, previous) {
                    handleChangeRouteError = false;
                    var title = config.docTitle + ' ' + (current.title || '');
                    $rootScope.title = title;
                }
            );

        }

        //#region Internal Methods        

        //#endregion
    }
})();
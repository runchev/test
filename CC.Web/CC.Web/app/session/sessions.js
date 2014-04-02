(function () {
    'use strict';

    var controllerId = 'sessions';

    // TODO: replace app with your module name
    angular.module('app').controller(controllerId,
        ['common', 'datacontext', 'config', sessions]);

    function sessions(common, datacontext, config) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var applyFilter = function() {};
        var keyCodes = config.keyCodes;
        
        vm.sessions = [];
        vm.title = 'Sessions';
        vm.refresh = refresh;
        vm.filteredSessions = [];
        vm.search = search;
        vm.sessionsSearch = '';
        vm.sessionsFilter = sessionsFilter;
        
        activate();
        function activate() {
            var promises = [getSession()];
            common.activateController(promises, controllerId)
                .then(function() {
                    applyFilter = common.createSearchThrottle(vm, 'sessions');
                    if (vm.sessionsSearch) {applyFilter(true);}
                    log('Activated Session View');
                });
        }

        function getSession(forceRemote) {
            return datacontext.getSessionPartials(forceRemote).then(function (data) {
                return vm.sessions = vm.filteredSessions= data;
            });
        }

        function refresh() {
            getSession(true);
        }
        
        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.sessionsSearch = '';
                applyFilter(true);
            } else {
                applyFilter();
            }
            
        }
        function sessionsFilter(session) {
            var textContains = common.textContains;
            var searchText = vm.sessionsSearch;
            var isMatch = searchText ?
                textContains(session.title, searchText)
                    || textContains(session.tagsFormatted, searchText)
                    || textContains(session.room.name, searchText)
                    || textContains(session.track.name, searchText)
                    || textContains(session.speaker.fullName, searchText)
                : true;
            return isMatch;
        }
    }
})();

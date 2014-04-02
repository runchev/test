(function () {
    'use strict';

    var controllerId = 'attendees';

    // TODO: replace app with your module name
    angular.module('app').controller(controllerId,
        ['common', 'datacontext', 'config', attendees]);

    function attendees(common, datacontext, config) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;
        
        vm.attendees = [];
        vm.attendeeCount = 0;
        vm.attendeeFilteredCount = 0;
        vm.attendeeSearch = '';
        vm.filteredAttendees = [];
        vm.search = search;
        vm.paging = {
            currentPage: 1,
            maxPageToShow: 5,
            pageSize: 15
        };
        vm.pageChanged = pageChanged;
        vm.title = 'Attendees';
        vm.refresh = refresh;

        Object.defineProperty(vm.paging, 'pageCount',
            {            
               get: function() {
                   return Math.floor(vm.attendeeFilteredCount / vm.pageSize) + 1;
               }
            });
        activate();
        function activate() {
            var promises = [getAttendees()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Attendees View'); });
        }

        function getAttendeeCount() {
            return datacontext.getAttendeeCount().then(function(data) {
                return vm.attendeeCount = data;
            });
        }

        function getAttendeeFilteredCount() {
            vm.attendeeFilteredCount = datacontext.getFilteredCount(vm.attendeeSearch);
        }

        function getAttendees(forceRemote) {
            return datacontext.getAttendees(forceRemote,
                vm.paging.currentPage, vm.paging.pageSize, vm.attendeeSearch).then(function (data) { 
                    vm.attendees = data;
                    getAttendeeFilteredCount();
                    if (!vm.attendeeCount || forceRemote) {
                        getAttendeeCount();
                    }  
                    return data;
                });
        }

        function refresh() {
            getAttendees(true);
        }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.attendeeSearch = '';
            }
            getAttendees();
        }

        function pageChanged(page) {
            if (!page) { return; }
            vm.paging.currentPage = page;
            getAttendees();
        }
    }
})();
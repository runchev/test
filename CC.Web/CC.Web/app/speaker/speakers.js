(function () {
    'use strict';

    var controllerId = 'speakers';

    // TODO: replace app with your module name
    angular.module('app').controller(controllerId,
        ['common', 'datacontext','config', speakers]);

    function speakers(common, datacontext,config) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;
        vm.speakers = [];
        vm.title = 'Speakers';
        vm.refresh = refresh;
        vm.speakerSearch = '';
        vm.search = search;
        vm.filteredSpeakers=[];
        
        activate();
        function activate() {
            var promises = [getSpeakers()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Speakers View'); });
        }

        function getSpeakers(forceRemote) {
            return datacontext.getSpeakerPartials(forceRemote).then(function (data) {
                vm.speakers = data;
                applyFilter();
                return vm.speakers;
            });
        }

        function refresh() {
            getSpeakers(true);
        }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.speakerSearch = '';
            }
            applyFilter();
        }

        function applyFilter() {
            vm.filteredSpeakers = vm.speakers.filter(speakerFilter);
        }

        function speakerFilter(speaker) {
            var isMatch = vm.speakerSearch ?
                common.textContains(speaker.fullName, vm.speakerSearch)
                : true;
            return isMatch;
        }
    }
})();

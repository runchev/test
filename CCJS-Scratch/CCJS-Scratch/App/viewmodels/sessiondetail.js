define(['services/datacontext', 'durandal/plugins/router','durandal/app','services/logger','durandal/system'],
    function (datacontext, router,app,logger,system) {
        var session = ko.observable();
        var rooms = ko.observableArray([]);
        var tracks = ko.observableArray([]);
        var timeSlots = ko.observableArray([]);
        var isSaving = ko.observable(false);
        var isDeleting = ko.observable(false);


        var activate = function (routeData) {
            var id = parseInt(routeData.id);
            initlookups();
            return datacontext.getSessionById(id, session);
        };
        var initlookups = function () {
            rooms(datacontext.lookups.rooms);
            tracks(datacontext.lookups.tracks);
            timeSlots(datacontext.lookups.timeSlots);


        };
        var goBack = function () {
            router.navigateBack();
        };
        var save = function () {
            isSaving(true);
            return datacontext.saveChanges().fin(complete);
            
            function complete(){
                isSaving(false);
            }
        };
        var cancel = function () {
            datacontext.cancelChanges();
        };
        var hasChanges = ko.computed(function () {
            return datacontext.hasChanges();
        });
        var canSave = ko.computed(function () {
            return hasChanges() && !isSaving();
        });
        var canDeactivate = function() {
            if (hasChanges()) {
                var title = "Leave?";
                var msg = "Really";
                return app.showMessage(msg, title, ['Yes', 'No'])
                    .then(confirm);

                function confirm(selectedOptions) {
                    if (selectedOptions === 'Yes') {
                        cancel();
                    }
                    return selectedOptions;
                }                
            }
            return true;
        };
        var deleteSession = function () {
                var title = "Delete session?";
                var msg = "Do you really want to delete this session?";
                isDeleting(true);
                return app.showMessage(msg, title, ['Yes', 'No'])
                    .then(confirmDelete);

                function confirmDelete(selectedItem) {
                    if (selectedItem === 'Yes') {
                        session().entityAspect.setDeleted();
                        save()
                        .then(success)
                        .fail(failed)
                        .fin(finish);
  
                        function success() {
                            router.navigateTo('#session');
                        }

                        function failed(error) {
                            cancel();
                            var msgError ='Error'. error.message;
                            logger.logError(msgError, error, system.getModuleId(vm), true);

                        }

                        function finish() {
                            return selectedItem;
                        }
                    }
                    isDeleting(false);
                }
        };
        var vm = {
            activate: activate,
            goBack: goBack,
            session: session,
            rooms: rooms,
            tracks: tracks,
            timeSlots: timeSlots,
            title: 'Session Details',
            save: save,
            cancel: cancel,
            hasChanges: hasChanges,
            canSave: canSave,
            canDeactivate: canDeactivate,
            deleteSession: deleteSession

            
        };
        return vm;
    });
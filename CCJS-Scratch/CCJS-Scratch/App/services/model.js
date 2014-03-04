define(['config'], function (config) {
    var imageSettings = config.imageSettings;
    var nulloDate = new Date(1990, 0, 1);

    var orderBy = {
        speaker: 'firstName, lastName',
        session: 'timeSlotId, level, speaker.firstName'
    };

    var entityNames = {
        speaker: 'Person',
        session: 'Session',
        room: 'Room',
        track: 'Track',
        timeslot: 'TimeSlot'
    };
    var createNullos = function(manager) {
        var unchanged = breeze.EntityState.Unchanged;
        createNullo(entityNames.timeslot, { start: nulloDate, isSessionSlot: true });
        createNullo(entityNames.room);
        createNullo(entityNames.track);
        createNullo(entityNames.speaker, {firstName:'[Select a person]' });

        function createNullo(entityName, values) {
            var initialValues = values ||
            { name: '[Select a ' + entityName.toLowerCase() + ' ]' };
            return manager.createEntity(entityName,initialValues,unchanged);
        }

    };

    var model = {
        configureMetadataStore: configureMetadataStore,
        entityNames: entityNames,
        orderBy: orderBy,
        createNullos: createNullos

    };

    return model;

    //#region Internal Methods
    function configureMetadataStore(metadataStore) {
        metadataStore.registerEntityTypeCtor(
            'Session', function () { this.isPartial = false; }, sessionInitializer);
        metadataStore.registerEntityTypeCtor(
            'Person', function () { this.isPartial = false; }, personInitializer);
        metadataStore.registerEntityTypeCtor(
            'TimeSlot', null, timeSlotInitializer);
    }

    function sessionInitializer(session) {
        session.tagsFormatted = ko.computed({
            read: function () {
                var text = session.tags();
                return text ? text.replace(/\|/g, ', ') : text;
            },
            write: function (value) {
                session.tags(value.replace(/\, /g, '|'));
            }
        });
    }

    function personInitializer(person) {
        person.fullName = ko.computed(function () {
            var fn = person.firstName();
            var ln = person.lastName();
            return ln ? fn + ' ' + ln : fn;
        });
        person.imageName = ko.computed(function () {
            return makeImageName(person.imageSource());
        });
    };
    
    function timeSlotInitializer(timeSlot) {
        timeSlot.name = ko.computed(function () {
            var start = timeSlot.start();
            var value =((start-nulloDate===0))?
                '[Select a timeslot]':
                (start && moment.utc(start).isValid()) ?
                    moment.utc(start).format('ddd hh:mm a') : '[Unknown]';
            return value;
        });
    }
    
    function makeImageName(source) {
        return imageSettings.imageBasePath +
            (source || imageSettings.unknownPersonImageSource);
    }
    //#endregion
});
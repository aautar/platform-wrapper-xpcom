Platform.Process = { };

/**
 * @param {int} _processId
 * @param {nsIProcess} _process
 * @param {Array} _observers
 */
Platform.Process.ProcessDescriptor = function(_processId, _process, _observers) {
    this.processId = _processId;
    this.process = _process;
    this.observers = _observers;

    this.getProcessId = function() {
        return this.processId;
    };
};


/**
 * Run native executable
 *
 * @param {String} _target path to executable
 * @param {String[]} _args arguments for executable
 * @param {boolean} _terminateOnExit whether or not to terminate the process when the current process is terminated
 * @returns {?ProcessDescriptor}
 */
Platform.Process.execute = function(_target, _args, _terminateOnExit) {

    try {

        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(_target);

        var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
        process.init(file);

        var args = [''];
        process.run(false, _args, _args.length);

        var procKillObserver = null;
        if(_terminateOnExit) {
            procKillObserver = this.generateProcessKillObserver(process);
            procKillObserver.register();
        }

        /**
         * TODO: better to return process id?
         */
        return new Platform.Process.ProcessDescriptor(process.pid, process, [procKillObserver]);
    }
    catch (_err) {
        Platform.Log.error(_err);
        return null;
    }

};


/**
 *
 * @param {nsIProcess} _processToKill
 */
Platform.Process.generateProcessKillObserver = function(_processToKill) {

    return new function() {

        this.observe = function(subject, topic, data) {
            // kill application when "quit-application" is observed
            _processToKill.kill();
        };

        this.register = function() {
            var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
            observerService.addObserver(this, "quit-application", false);
        };

        this.unregister = function() {
            var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
            observerService.removeObserver(this, "quit-application");
        };
    };

};

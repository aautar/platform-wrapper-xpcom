Platform.UserInterface = { };


Platform.UserInterface.FilePickerMode = {
    
    OPEN : 1,
    SAVE : 2
    
};

Platform.UserInterface.FilePickerFilter = function(_title, _extensionsFilter, _defaultExtensionToAppend) {   
    this.getTitle = function() {
        return _title;
    };
    
    this.getExtensionsFilter = function() {
        return _extensionsFilter;
    };

    this.getDefaultExtensionToAppend = function() {
        return _defaultExtensionToAppend;
    };    
};

/**
 * Show file picker
 * 
 * @param {String} _dialogTitle
 * @param {Platform.UserInterface.FilePickerFilter[]} _filters
 * @param {Platform.UserInterface.FilePickerMode} _filePickerMode mode (open state or save state) for dialog
 * @returns {String} filepath of selected file, null if user cancelled
 */
Platform.UserInterface.showFilePickerDialog = function(_dialogTitle, _filters, _filePickerMode) {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    
    var xulFilePickerMode = nsIFilePicker.modeOpen;
    if(_filePickerMode === Platform.UserInterface.FilePickerMode.SAVE) {
        xulFilePickerMode = nsIFilePicker.modeSave;
    }
    
    fp.init(window, _dialogTitle, xulFilePickerMode);          

    for(var i=0; i<_filters.length; i++) {
        fp.appendFilter(_filters[i].getTitle(), _filters[i].getExtensionsFilter());      
    }

    var selectedFile = null;
    var res = fp.show();
    if (res != nsIFilePicker.returnCancel) {
        selectedFile = fp.file;
    }
    
    if(selectedFile === null) {
        return null;
    }
    
    var pathWithExtension = selectedFile.path;
    if(pathWithExtension !== null && pathWithExtension === pathWithExtension.split('.').pop()) { // No file extension
        pathWithExtension = pathWithExtension + _filters[fp.filterIndex].getDefaultExtensionToAppend();
    }

    return pathWithExtension;
};

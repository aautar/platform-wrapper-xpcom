Platform.UserInterface = { };


Platform.UserInterface.FilePickerMode = {
    
    OPEN : 1,
    SAVE : 2
    
};

Platform.UserInterface.FilePickerFilter = function(_title, _extensionsFilter) {
    this.title = _title;
    this.extensionsFilter = _extensionsFilter;
    
    this.getTitle = function() {
        return this.title;
    };
    
    this.getExtensionsFilter = function() {
        return this.extensionsFilter;
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
    
    return selectedFile.path;
};


Platform.UserInterface.openDialog = function() {
    
    
};

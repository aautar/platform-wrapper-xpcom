Platform.Environment = {}; 

/**
 * Get the base path of the current application
 * 
 * @returns {String}
 */
Platform.Environment.getBasePath = function() {

    // CurProcD seems to always give installation dir
    // resource:app errors out?
    var path = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("CurProcD", Components.interfaces.nsIFile).path; 
    return path + Platform.Environment.getPathSeparator();
};


Platform.Environment.OS = { 
    WINNT : 'WINNT'
};

/**
 * Get the current operating system type
 * 
 * @returns {String} Platform.Environment.OS constant
 */
Platform.Environment.getOS = function() {        
    var env = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime);
    return env.OS;        
};

/**
 * Get the path separator used in the current environment
 * 
 * @returns {String}
 */
Platform.Environment.getPathSeparator = function() {

    if(Platform.Environment.getOS() === Platform.Environment.OS.WINNT) {
        return "\\";
    }
    
    return "/";   
};
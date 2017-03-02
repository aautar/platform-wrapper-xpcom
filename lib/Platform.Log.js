Platform.Log = { };

/**
 * Log an error message
 * 
 * @param {String} _errorString
 * @returns boolean
 */
Platform.Log.error = function(_errorMessage) {
    Components.utils.reportError(_errorMessage);
    return true;
};
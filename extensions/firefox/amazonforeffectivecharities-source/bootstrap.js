Components.utils.import("resource://gre/modules/Services.jsm");

var ci = Components.interfaces;

var windowListener = {
    onOpenWindow: function(subject) {
        var dw = subject.QueryInterface(ci.nsIInterfaceRequestor).getInterface(ci.nsIDOMWindow);
        dw.addEventListener("load", function() {
            if (dw.document.documentElement.getAttribute("windowtype") == "navigator:browser")
                initializeWindow(dw);
            }, false);
    },
    onCloseWindow: function (subject) {
    },
    onWindowTitleChange: function (subject, title) {
    }
}

var progressListener = {
    onLocationChange: function(progress, request, url, flags) {
        if (!url)
            return;
        var tag;
        var host = url.asciiHost;
        if (/aws\.amazon\./i.test(host))
            return;
        if (/amazon\.ca$/i.test(host))
            tag = "tag=s4charityca-20";
        else if (/amazon\.com$/i.test(host))
            tag = "tag=s4charity-20";
        else if (/amazon\.co\.uk$/i.test(host))
            tag = "tag=s4charityuk-21";
        else if (/amazon\.it$/.test(host))
            tag = "tag=s4charityit-21";
        else if (/amazon\.es$/i.test(host))
            tag = "tag=s4charity-21";
        else if (/amazon\.de$/.test(host))
            tag = "tag=s4charityde-21";
        else
            return;
        var re = new RegExp("(\\?|&)" + tag + "(&|$)");
        url = url.asciiSpec;
        if (re.test(url))
            return;
        if (request)
            request.cancel(Components.results.NS_BINDING_ABORTED);
        url = url.replace(/(\?|&)tag=.*?(&|$)/, "$1");
        if (url.indexOf("?") < 0)
            url += "?";
        else if (url.substr(-1) != "&")
            url += "&";
        url += tag;
        progress.DOMWindow.location.replace(url);
    }
}

function initializeWindow(w) {
    if (w.gBrowser && w.gBrowser.addProgressListener)
        w.gBrowser.addProgressListener(progressListener);
}

function resetWindow(w) {
    if (w.gBrowser && w.gBrowser.removeProgressListener)
        w.gBrowser.removeProgressListener(progressListener);
}

function startup(data, reason) {
    var windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements())
        initializeWindow(windows.getNext());
    Services.wm.addListener(windowListener);
}

function shutdown(data, reason) {
    if (reason == APP_SHUTDOWN)
        return;
    Services.wm.removeListener(windowListener);
    var windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements())
        resetWindow(windows.getNext());
}

function install(data, reason) {
}

function uninstall(data, reason) {
}


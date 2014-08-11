
// REQUEST QUEUE OBJECT
var RequestQueue = function () {
    // queue of requests (array of Request objects)
    this.Requests = new Array();
    this.isRunning = false;
    this.Count = function () { return this.Requests.length; };

    // add 1 request
    this.AddRequest = function (req) {
        if (req && req instanceof Request)
            this.Requests.push(req);
    }
    // remove 1 request
    this.RemoveRequest = function (index) {
        if (!isNaN(index) && index > -1) {
            aa("count " + this.Count());
            this.Requests.splice(index, 1);
        }
    }

    // sequentially but asynchronously process ajax requests added onto the Requests array
    this.processRequestQueue = function () {
        aa('start processing');
        var rq = this;                   // store the current queue object because anonymous functions have "this" as the window
        if (rq.Requests.length > 0) {
            rq.isRunning = true;
            var req = rq.Requests[0]; // always process the first index, then remove it after processing
            aa(req);
            rq.seqAjax(req.Data, req.URL, req.Method, req.Async, function (xhr) {
                aa(xhr);
                if (xhr) {
                    req.CallBack(xhr);      // outer callback
                    aa(rq.RemoveRequest);
                    rq.RemoveRequest(0);  // remove first request from queue
                    aa("queue now has:" + rq.Count());
                    if (rq.Count() > 0) {
                        rq.processRequestQueue();
                    }
                    else {
                        rq.isRunning = false;
                    }
                }
            });
        }
    };

    // SEQUENTIAL AJAX CALL
    this.seqAjax = function (data, url, method, async, callback) {
        aa('seqajax');
        $.ajax({
            url: url,
            data: data,
            type: method,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            async: async,
            complete: function (xhr) {
                if (xhr.hasOwnProperty('responseText')) {
                    xhr = JSON.parse(xhr.responseText);
                    if (xhr.hasOwnProperty('d'))
                        xhr = xhr.d;
                }
                // call the callback passed by the caller (processRequestQueue)
                if (typeof callback == 'function')
                    callback(xhr);
            }
        });
    };
}

// REQUEST OBJECT (Data is the data parameter for the ajax call)
var Request = function (data, url, method, async, callback) {
    this.Data = data;
    this.URL = url;
    this.Method = method;
    this.Async = async;
    this.CallBack = callback;
}
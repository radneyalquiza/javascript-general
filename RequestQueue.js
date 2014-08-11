
// REQUEST QUEUE
// v1.0
// by Radney Alquiza

// - This small structure abstracts Queued AJAX requests by looping through a collection of Request objects
//   passed into the Request Queue.
// - The process is ASYNCHRONOUS (default) and will sequentially perform AJAX requests only after a previous
//   request has been COMPLETED. This ensures a request doesn't conflict with locked threads on the backend
//   when on ASYNCHRONOUS nature.
// - The RequestQueue object contains a queue(array) that grows whenever the client adds a request object
//   and will always process the FIRST request object in the array.
// - After a Request has completed processing the current request (first in the queue) is removed from the
//   queue.
// - A Request object contains data parametes and settings that will be applied to the AJAX request

// USAGE:

/* 
    // create the queue object
    var requestQueue = new RequestQueue();

    // add a new request object to the queue
    requestQueue.AddRequest(new Request({}, 'page.aspx/method', true, function(xhr) {
      --- this is an anonymous callback function: do stuff here, "xhr" is the expected JSON return object ---
    })); 

    var r2 = new Request({}, 'page.aspx/method2', true, function(xhr) { alert(xhr); });
    requestQueue.AddRequest(r2);

    // run the requests in the queue (First In First Out)
    requestQueue.processRequestQueue();
*/

// REQUEST OBJECT (Data is the data parameter for the ajax call)
var Request = function (data, url, method, async, callback) {
    this.Data = data;
    this.URL = url;
    this.Method = method;
    this.Async = async;
    this.CallBack = callback;
}

// REQUEST QUEUE OBJECT
var RequestQueue = function () {
    // queue of requests (array of Request objects)
    this.Requests = new Array();
    this.isRunning = false;
    this.Count = function () { return this.Requests.length; };

    // add 1 request (if the object being added is a Request object)
    this.AddRequest = function (req) { if (req && req instanceof Request)  this.Requests.push(req); }

    // remove 1 request by its index (usually 1st or 0)
    this.RemoveRequest = function (index) {
        if (!isNaN(index) && index > -1) {
            aa("count " + this.Count());
            this.Requests.splice(index, 1);
        }
    }

    // sequentially but asynchronously process ajax requests added onto the Requests array
    this.processRequestQueue = function () {
        var rq = this;                   // store the current queue object because anonymous functions have "this" as the window
        if (rq.Requests.length > 0) {
            rq.isRunning = true;
            var req = rq.Requests[0]; // always process the first index, then remove it after processing
            rq.seqAjax(req.Data, req.URL, req.Method, req.Async, function (xhr) {
                aa(xhr);
                if (xhr) {
                    req.CallBack(xhr);      // outer callback
                    rq.RemoveRequest(0);  // remove first request from queue
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


## Usage


    // create a router
    var router = new Router();

    // define routes
    router.define('/hello/world', function(){
      // `this` refers to the request inside of the handler
      if(this.method == 'GET'){ alert('hello, world'); }
      else                    { alert('hello, world via ' + this.method); }
    }).resources('users', {
      show    : function(){
        $.get(this.path, this.queryParams, function(data) {
          $('#wrapper').html(data);
        });
      },
      index   : function(){
        // load users...
      },
      edit    : function(){
        // load the edit user form
      }
    }).catchAll(function(){
      // all requests that do not match route will be passed to this handler
    }).default(function(){
      // the default route to push on initial page load
    });

## Requirements

Currently requires [jQuery](https://github.com/jquery/jquery), [jquery.url.js](https://github.com/peburrows/jQuery-URL-Parser), and [jquery.ba-bbq.js](https://github.com/cowboy/jquery-bbq), although I'll soon be working to eliminate those dependencies
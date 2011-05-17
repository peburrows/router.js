## Usage

  // create a router
  var router = new Router();

  // define routes
  router.define('/hello/world', function(){
    // `this` refers to the request inside of the handler
    if(this.method == 'GET'){ alert('hello, world'); }
    else                    { alert('hello, world via ' + this.method); }
  });

## Requirements

Currently requires [jQuery](https://github.com/jquery/jquery), [jquery.url.js](https://github.com/peburrows/jQuery-URL-Parser), and [jquery.ba-bbq.js](https://github.com/cowboy/jquery-bbq), although I'll soon be working to eliminate those dependencies
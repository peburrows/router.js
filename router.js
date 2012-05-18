function Router(){
  var self = this,
      router = self;

  function Request(path, method, body){
    var url = $.url.setUrl(path),
        self = this;

    this.fullPath     = path;
    this.queryString  = url.attr('query');
    this.path         = url.attr('path');
    this.queryParams  = url.param();
    this.method       = method || 'GET';
    this.body         = body;

    var pieces        = this.path.split('/');

    // drop the first piece if it's an empty string
    if(pieces[0] === ''){ this.pathPieces = pieces.slice(1); }
    else{ this.pathPieces = pieces; }

    var route         = router.findRoute(this.path);
    this.pathParams = (route ? router.pathParams(this.path, route) : {});

    this.params       = $.extend({}, this.pathParams, this.queryParams);

    this.perform      = function(){
      if(route){
        var doc = $(document);
        doc.trigger('request:before');
        route.handler.call(this);
        doc.trigger('request');
      }
    };
  }

  var routes = [],
      catchAll, defaultRoute, queryString, fragment, requestUrl;

  this.createRequest = function(path, method, body){
    var request = new Request(path, method, body);
    request.perform();
  };

  function handleHashChange(e){
    self.createRequest($.param.fragment());
  }

  this.pushDefaultRoute = function(){
    if(defaultRoute){ this.goTo(defaultRoute); }
  }

  this.setDefault = function(route)   { defaultRoute = route; };
  this.addRoute   = function(r)       { routes.push(r); };
  this.routes     = function()        { return routes; };

  this.goTo       = function(where)   {
    var url   = $.url.setUrl(where),
        hash  = url.attr('anchor');

    // eventually, we'll need to somehow push the hash/anchor too
    $.bbq.pushState('#' + url.attr('path'));
  };

  this.findRoute    = function(path){
    var parts;
    for(var i=0; i<routes.length; i++){
      if(routes[i].matcher.test(path)){
        return routes[i];
      }
    }
    // nothing was found, so return false (for now)
    return false;
  };

  this.pathParams   = function(path, theRoute){
    var foundParams = {};
    var parts = path.match(theRoute.matcher);
    for(var i=theRoute.params.length - 1; i >= 0; i--){
      foundParams[theRoute.params[i]] = parts[i+1];
    }
    return foundParams;
  };

  // event handlers
  $(window).bind('hashchange', handleHashChange);
  $(document).ready(function(){
    if($.param.fragment() && $.param.fragment() != '/'){ $(window).trigger('hashchange'); }
    else{ self.pushDefaultRoute(); }
  });
}

Router.prototype.catchAll   = function(handler) {
  this.addRoute({'matcher':(/.*/), 'params':[], 'handler':handler});
  return this
};

Router.prototype.define = function(route, handler){
  // add the route and handler to the routes array
  // 1. create the regular expression to use to match the routes
  var segment = /:([^:]+)/,
      parts   = route.split('/'),
      partNames = [];

  route = route.replace(/^\/+/, '');

  for (var i=0; i < parts.length; i++) {
    var matchedParts;
    if( matchedParts = parts[i].match(segment) ){
      parts[i] = '([^\\/]+)';
      partNames.push(matchedParts[1])
    }
  };

  // join them with a slash
  var matcher = new RegExp('^' + parts.join('\\/') + '\/?$');

  // 2. add that regular express and handler to the routes
  // console.log("on a defining route, here are the partNames:", partNames, matcher);
  this.addRoute({'matcher':matcher, 'params':partNames, 'handler':handler});
  return this;
};

Router.prototype.resources = function(resource, handlers){
  var self = this;

  if((/\//).test(resource)){
    var parts = resource.split('/');
    for (var i=0; i < parts.length; i++) {
      if( i+1 != parts.length){
        // this is rudimentary, but for now, just drop the last character
        parts[i] = parts[i] + '/:' + parts[i].slice(0, -1) + '_id';
      }
    };
    resource = parts.join('/');
  }

  resource = '/' + resource;
  for(var action in handlers){
    if(/show/.test(action)){
      self.define(resource + '/:id', handlers[action]);
    }else if(/index/.test(action)){
      self.define(resource, handlers[action]);
    }else if(/edit/.test(action)){
      self.define(resource + '/:id/edit', handlers[action]);
    }
  }

  // return this so we can chain methods
  return this;
};

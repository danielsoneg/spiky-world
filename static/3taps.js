if (typeof jQuery == 'undefined') alert('jQuery required');

var threeTapsClient = function(authId, agentId) {
	this.agentId = agentId || '';
	this.authId = authId || '';
	
	for (var type in threeTapsClient.clients) {
		var client = threeTapsClient.clients[type];
		this[type] = new client(this);
	}
};

threeTapsClient.clients = {};

threeTapsClient.register = function(type, client) {
	threeTapsClient.clients[type] = client;
};

threeTapsClient.prototype = {
	agentId: null,
	authId: null,
	response: null,

	request: function(path, method, params, callback) {
		params = params || {};

		var url = 'http://3taps.net' + path + method + '?callback=?';

		$.getJSON(url, params, function(response) {
				callback(response);
		});
			
		return true;
		
	}
};

var threeTapsGeocoderClient = function(authId, agentId) {
	if (authId instanceof threeTapsClient) {
		this.client = authId;
	} else {
		this.client = new threeTapsClient(authId, agentId);
	}
};

threeTapsGeocoderClient.prototype = {
	client: null,

	auth: true,
	path: '/geocoder/',
	
	geocode: function(data, callback) {
		var params = {
			agentID: this.client.agentId
			,authID: this.client.authId
			,data: data
		};
		return this.client.request(this.path, 'geocode', params, function(results) {
			callback(results);
		});
	}
};

threeTapsClient.register('geocoder', threeTapsGeocoderClient);

var threeTapsReferenceClient = function(authId, agentId) {
	if (authId instanceof threeTapsClient) {
		this.client = authId;
	} else {
		this.client = new threeTapsClient(authId, agentId);
	}
};

threeTapsReferenceClient.prototype = {
	client: null,

	auth: false,
	path: '/reference/',
	
	category: function(callback) {
		return this.client.request(this.path, 'category', null, function(results) {
			callback(results);
		});
	},

	location: function(callback) {
		return this.client.request(this.path, 'location', null, function(results) {
			callback(results);
		});
	},

	source: function(callback) {
		return this.client.request(this.path, 'source/get', null, function(results) {
			callback(results);
		});
	}
};

threeTapsClient.register('reference', threeTapsReferenceClient);
	
	
var threeTapsPostingClient = function(authId, agentId) {
	if (authId instanceof threeTapsClient) {
		this.client = authId;
	} else {
		this.client = new threeTapsClient(authId, agentId);
	}
};

threeTapsPostingClient.prototype = {
	client: null,

	auth: false,
	path: '/posting/',
	
	exists: function(ids, callback) {
		var params = {
			ids: ids
		};
		return this.client.request(this.path, 'exists', params, function(results) {
			callback(results);
		});
	},
	
	'delete': function(data, callback) {
		var params = {
			agentID: this.client.agentId
			,authID: this.client.authId
			,data: data
		};
		return this.client.request(this.path, 'delete', params, function(results) {
			callback(results);
		});
	},
	
	error: function(postID, callback) {
		return this.client.request(this.path, 'error/' + postID, null, function(results) {
			callback(results);
		});
	},

	get: function(postID, callback) {
		return this.client.request(this.path, 'get/' + postID, null, function(results) {
			callback(results);
		});
	},
	
	create: function(data, callback) {
		var params = {
			data: data
		};
		return this.client.request(this.path, 'create', params, function(results) {
			callback(results);
		});
	},
	
	update: function(data, callback) {
		var params = {
			agentID: this.client.agentId
			,authID: this.client.authId
			,data: data
		};
		return this.client.request(this.path, 'update', params, function(results) {
			callback(results);
		});
	}
};

threeTapsClient.register('posting', threeTapsPostingClient);

var threeTapsNotificationsClient = function(authId, agentId) {
	if (authId instanceof threeTapsClient) {
		this.client = authId;
	} else {
		this.client = new threeTapsClient(authId, agentId);
	}
};

threeTapsNotificationsClient.prototype = {
	client: null,

	auth: false,
	path: '/notifications/',

	firehose: function(params, callback) {
    return this.client.request(this.path, 'firehose', params, function(results) {
      callback(results);
    });
  },

	'delete': function(params, callback) {
    return this.client.request(this.path, 'delete', params, function(results) {
      callback(results);
    });
  },


	'get': function(params, callback) {
    return this.client.request(this.path, 'get', params, function(results) {
      callback(results);
    });
  },

	create: function(params, callback) {
		return this.client.request(this.path, 'create', params, function(results) {
			callback(results);
		});
	}
};

threeTapsClient.register('notifications', threeTapsNotificationsClient);

var threeTapsSearchClient = function(authId, agentId) {
	if (authId instanceof threeTapsClient) {
		this.client = authId;
	} else {
		this.client = new threeTapsClient(authId, agentId);
	}
};

threeTapsSearchClient.prototype = {
	client: null,

	auth: false,
	path: '/search/',
	
	'search': function(params, callback) {
		return this.client.request(this.path, '', params, function(results) {
			callback(results);
		});
	},
	
	range: function(params, callback) {
		return this.client.request(this.path, 'range', params, function(results) {
			callback(results);
		});
	},

	summary: function(params, callback) {
		return this.client.request(this.path, 'summary', params, function(results) {
			callback(results);
		});
	},

	count: function(params, callback) {
		return this.client.request(this.path, 'count', params, function(results) {
			callback(results);
		});
	},

	bestMatch: function(params, callback) {
		return this.client.request(this.path, 'best-match', params, function(results) {
			callback(results);
		});
	}
};

threeTapsClient.register('search', threeTapsSearchClient);

var threeTapsStatusClient = function(authId, agentId) {
	if (authId instanceof threeTapsClient) {
		this.client = authId;
	} else {
		this.client = new threeTapsClient(authId, agentId);
	}
};

threeTapsStatusClient.prototype = {
	client: null,

	auth: true,
	path: '/status/',
	
	update: function(data, callback) {
		var params = {
			agentID: this.client.agentId
			,authID: this.client.authId
			,data: data
		};
		return this.client.request(this.path, 'update', params, function(results) {
			callback(results);
		});
	},
	
	get: function(data, callback) {
		var params = {
			agentID: this.client.agentId
			,authID: this.client.authId
			,data: data
		};
		return this.client.request(this.path, 'get', params, function(results) {
			callback(results);
		});
	},

	system: function(callback) {
		var params = {
			agentID: this.client.agentId
			,authID: this.client.authId
		};
		return this.client.request(this.path, 'system', params, function(results) {
			callback(results);
		});
	}
};

threeTapsClient.register('status', threeTapsStatusClient);

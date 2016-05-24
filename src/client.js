var Promise = require('bluebird');
var superagent = require('superagent');
var superagentPrefix = require('superagent-prefix');
var uuid = require('uuid');

var ENDPOINT = 'http://oddworks.io';
var JWT_HEADER = 'x-access-token';
var TYPES = ['videos', 'collections', 'views'];

function Client(options) {
	this.options = options || {};

	if (!this.options.jwt) {
		throw new Error('options.jwt is required');
	}

	return this;
}
module.exports = Client;

TYPES.forEach(function (type) {
	Client.prototype['get' + type.charAt(0).toUpperCase() + type.slice(1)] = function (id) {
		return new Promise(function (resolve, reject) {
			superagent
				.get('/' + type + ((id) ? '/' + id : ''))
				.use(superagentPrefix(this.options.endpoint || ENDPOINT))
				.set(this.options.endpoint || JWT_HEADER, this.options.jwt)
				.set('Accept', 'application/json')
				.end(function (err, res) {
					if (err) {
						return reject(err);
					}

					resolve(res);
				});
		});
	};
});

Client.prototype.addVideoListeners = function () {
	this.userId = this.options.userId || localStorage.getItem('odd-user-id') || uuid.v4();
	localStorage.setItem('odd-user-id', this.userId);

	var allVideos = document.getElementsByTagName('video');
	for (var index = 0; index < allVideos.length; index++) { // for-loop since its not an array, but a NodeList
		var video = allVideos[index];
		var oddId = video.getAttribute('data-odd-id');
		if (oddId) {
			_addVideoListeners(video, this.userId);
		} else {
			delete allVideos[index];
		}
	}

	window.addEventListener('beforeunload', function () {
		for (var index = 0; index < allVideos.length; index++) { // for-loop since its not an array, but a NodeList
			var video = allVideos[index];
			var id = video.getAttribute('data-odd-id');
			console.log(this.userId, id, video.currentTime);
		}
	}.bind(this));
};

function _addVideoListeners(video, userId) {
	var id = video.getAttribute('data-odd-id');

	video.addEventListener('abort', function () {
		console.log(userId, id, 'aborted', video.currentTime);
	}, true);

	video.addEventListener('ended', function () {
		console.log(userId, id, 'ended', video.currentTime);
	}, true);

	video.addEventListener('play', function () {
		console.log(userId, id, 'play', video.currentTime);
	}, true);

	video.addEventListener('pause', function () {
		console.log(userId, id, 'pause', video.currentTime);
	}, true);
}

'use strict';
const https = require('https');
const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const util = require('gulp-util');
const through = require('through2');
const cheerio = require('cheerio');

const PLUGIN_NAME = 'gulp-inline-images';
const MIME_TYPE_REGEX = /.+\/([^\s]*)/;
const INLINE_ATTR = 'inline';
const NOT_INLINE_ATTR = `!${INLINE_ATTR}`;

function plugin(options = {}){
	var selector = options.selector || 'img[src]';
	var attribute = options.attribute || 'src';
	var getHTTP = options.getHTTP || false;

	return through.obj(function(file, encoding, callback){
		if(file.isStream()){
			this.emit('error', new util.PluginError(PLUGIN_NAME, 'Streams are not supported!'));
			return callback();
		}

		if(file.isBuffer()){
			var contents = file.contents.toString(encoding);
			// Load it into cheerio's virtual DOM for easy manipulation
			var $ = cheerio.load(contents);
			var inline_flag = $(`img[${INLINE_ATTR}]`);
			// If images with an inline attr are found that is the selection we want
			var img_tags = inline_flag.length ? inline_flag : $(selector);
			var count = 0;

			img_tags.each(function(){
				var $img = $(this);
				var src = $img.attr(attribute);
				// Save the file format from the extension
				var ext_format = path.extname(src).substr(1);

				// If inline_flag tags were found we want to remove the inline tag
				if(inline_flag.length){
					$img.removeAttr(INLINE_ATTR);
				}

				// Find !inline attribute
				var not_inline_flag = $img.attr(NOT_INLINE_ATTR);
				
				if(typeof not_inline_flag !== typeof undefined && not_inline_flag !== false){
					// Remove the tag and don't process this file
					return $img.removeAttr(NOT_INLINE_ATTR);
				}
				
				// Count async ops
				count++;

				getSrcBase64(options.basedir || file.base, options.getHTTP, src, function(err, result, res_format, skip_formatting){
					if(skip_formatting) return src

					if(err) console.error(err);
					else
					// Need a format in and a result for this to work
					if(result && (ext_format || res_format)){
						$img.attr('src', `data:image/${ext_format};base64,${result}`);
					} else {
						console.error(`Failed to identify format of ${src}!`);
					}
					if(!--count){
						file.contents = Buffer.from($.html());
						callback(null, file);
					}
				});
			});

			// If no files are processing we don't need to wait as none were ever started
			if(!count){
				file.contents = Buffer.from($.html());
				callback(null, file);
			}
		}
	});
}

function getHTTPBase64(url, callback) {
	// Get applicable library
	var lib = url.startsWith('https') ? https : http;
	// Initiate a git request to our URL
	var req = lib.get(url, (res) => {
		// Check for redirect
		if(res.statusCode >= 301 && res.statusCode < 400 && res.headers.location){
			// Redirect
			return getHTTPBase64(res.headers.location, callback);
		}
		// Check for HTTP errors
		if(res.statusCode < 200 || res.statusCode >= 400){
			return callback(new Error('Failed to load page, status code: ' + res.statusCode));
		}
		// Get file format
		var format;
		if(res.headers['content-type']){
			var matches = res.headers['content-type'].match(MIME_TYPE_REGEX);
			if(matches) format = matches[1];
		}

		// Create an empty buffer to store the body in
	  	var body = Buffer.from([]);

		// Append each chunk to the body
	  	res.on('data', (chunk) => body = Buffer.concat([body, chunk]));

		// Done callback
	  	res.on('end', () => callback(null, body.toString('base64'), format));
	});

	// Listen for network errors
	req.on('error', (err) => callback(err));
}

function getSrcBase64(base, getHTTP, src, callback){
	if(!url.parse(src).hostname){
		// Get local file
		var file_path = path.join(base, src);
		fs.readFile(file_path, 'base64', callback);
	}else{
		// Get remote file
		if (getHTTP) {
			getHTTPBase64(src, callback);
		} else {
			callback(null, src, null, true)
		}
	}    
}

module.exports.plugin = plugin;
module.exports.getHTTPBase64 = getHTTPBase64;
module.exports.getSrcBase64 = getSrcBase64;

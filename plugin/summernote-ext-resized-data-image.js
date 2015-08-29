(function (factory) {
	/* global define */
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals: jQuery
		factory(window.jQuery);
	}
}(function ($) {

	// predefined settings
	var max_width = 800,
		max_height = 800,
		type = 'image/jpeg',
		compression = 0.9,
		fill_style = 'white';

	// template
	var template = $.summernote.renderer.getTemplate();


	/**
	 * @class plugin.resizedDataImage
	 *
	 * resizedDataImage Plugin
	 *
	 * dependencies:
	 * exif.js (https://github.com/exif-js/exif-js)
	 * binaryajax.js (https://github.com/jseidelin/binaryajax)
	 *
	 * this blog post helped a lot:
	 * http://chariotsolutions.com/blog/post/take-and-manipulate-photo-with-web-page/
	 */
	$.summernote.addPlugin({
		name: 'resizedDataImage',
		buttons: {
			resizedDataImage: function () {
				return template.button('<div class="fileinput-button">' +
					'<i class="fa fa-camera"></i>' +
					'<input type="file" name="file" accept="image/*">' +
					'</div>', {
					event: 'resizedDataImage',
					hide: true
				});
			}
		},
		events: {
			resizedDataImage: function (event, editor, layoutInfo) {
				var $editable = layoutInfo.editable(),
					$input = $(event.target);
				$input.on('change', function () {
					if (this.files.length === 0) {
						return;
					}

					var imageFile = this.files[0],
						img = new Image(),
						url = window.URL ? window.URL : window.webkitURL;

					img.src = url.createObjectURL(imageFile);
					img.onload = function (e) {
						// release URL object as soon as it is unused
						url.revokeObjectURL(this.src);

						var width = img.width,
							height = img.height,
							binaryReader = new FileReader();

						binaryReader.onloadend = function (d) {
							var exif = EXIF.readFromBinaryFile(d.target.result),
								canvas = document.createElement('canvas');

							// check if image is rotated by 90° or 270°
							switch (exif.Orientation) {
								case 8:
									width = img.height;
									height = img.width;
									break;
								case 7:
									width = img.height;
									height = img.width;
									break;
								case 6:
									width = img.height;
									height = img.width;
									break;
								case 5:
									width = img.height;
									height = img.width;
									break;
							}

							// apply maximum resolution
							if (width / max_width > height / max_height) {
								if (width > max_width) {
									height *= max_width / width;
									width = max_width;
								}
							} else {
								if (height > max_height) {
									width *= max_height / height;
									height = max_height;
								}
							}
							canvas.width = width;
							canvas.height = height;

							var ctx = canvas.getContext('2d');
							ctx.fillStyle = fill_style;
							ctx.fillRect(0, 0, canvas.width, canvas.height);

							// transform flipped or rotated images
							// see: http://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/
							switch (exif.Orientation) {
								case 8:
									ctx.setTransform(0, -1, 1, 0, 0, height);
									ctx.drawImage(img, 0, 0, height, width);
									break;
								case 7:
									// TODO: flip horizontally and rotate left
									break;
								case 6:
									ctx.setTransform(0, 1, -1, 0, width, 0);
									ctx.drawImage(img, 0, 0, height, width);
									break;
								case 5:
									// TODO: flip horizontally and rotate right
									break;
								case 4:
									// TODO: flip horizontally and vertically
									break;
								case 3:
									ctx.setTransform(1, 0, 0, -1, 0, height);
									ctx.drawImage(img, 0, 0, width, height);
									break;
								case 2:
									// TODO: flip vertically
									break;
								case 1:
									ctx.setTransform(1, 0, 0, 1, 0, 0);
									ctx.drawImage(img, 0, 0, width, height);
									break;
								default:
									ctx.setTransform(1, 0, 0, 1, 0, 0);
									ctx.drawImage(img, 0, 0, width, height);
									break;
							}

							var data = canvas.toDataURL(type, compression);
							editor.insertImage($editable, data);
						};

						// read the file into a binary ArrayBuffer
						binaryReader.readAsArrayBuffer(imageFile);
					};

					// unbind trigger and unset value
					$input.off('change').val('');
				});
			}
		}
	});
}));

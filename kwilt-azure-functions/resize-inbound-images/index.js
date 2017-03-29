var jimp = require('jimp');

module.exports = function (context, original) {
  context.log('Resizing Image: ' + context.bindingData.name)
  jimp.read(original, function(err, image) {
    if (err) {
      context.log('Error reading into jimp.')
      context.log(err);
      context.done();
      throw err;
    }

    context.log('Successfully read image.');
        
    // Resize image
    var maxWidth = parseInt(process.env.ImageResizeMaxWidth);
    image.scaleToFit(maxWidth, jimp.AUTO);

    image.getBuffer(jimp.AUTO, function(err, buffer) {

      context.log('Returning resized image as buffer.');

      // Assign buffer to out binding (blob storage)
      context.bindings.resized = buffer;

      // Close context (end function)
      context.done();
    });
  });
}
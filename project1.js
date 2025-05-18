// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the for    eground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
  const bgData = bgImg.data;
  const fgData = fgImg.data;

  // We go through the each pixel of the foreground image
  for (let y = 0; y < fgImg.height; y++) {
    for (let x = 0; x < fgImg.width; x++) {


      // Calculate the index for the foreground as if it was 1D array
      const fgIndex = (y * fgImg.width + x) * 4;

      // Get foreground's position on the background image
      const bgX = x + fgPos.x
      const bgY = y + fgPos.y

      // If the foreground image is within the bounds of the background image
      if (bgX >= 0 && bgX < bgImg.width && bgY >=0 && bgY < bgImg.height) {
	
	// Get index of background image as if it was 1D array
	const bgIndex = (bgY * bgImg.width + bgX) * 4;

	// Normalize the alpha to be between 0 and 1
	const alpha = fgOpac * fgData[fgIndex+3] / 255.0;

	// Alpha blending for RGB channels
	for (let i = 0; i < 3; i++) {
	  bgData[bgIndex+i] = Math.round(alpha * fgData[fgIndex+i] + (1 - alpha) * bgData[bgIndex+i]);
	}

	// Alpha blending for the fourth channel
	bgData[bgIndex+3] = Math.round(alpha * 255 + (1 - alpha) * bgData[bgIndex+3]);
      }
    }
  }
}

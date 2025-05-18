# Image Compositor (CS4600 Project 1)

This is the first project within the University of Utah's CS4600 Computer Graphics course.
It implements a very simple image compositor which allows the composition of multiple image layers using alpha blending techniques to produce a final rendered image. 


## Features

- Layer based image composition
- Adjusting opacity per layer
- Alpha blending on the pixel level
- Rendering result image on the canvas


## How it works

1. Images are loaded into layers
2. Each layer has an opacity setting
3. The composite() function merges all layers into a single final image using alpha compositing rules
4. Final image is rendered onto a <canvas> element in the browser


## How alpha blending works

Alpha blending is the process of combining a foreground pixel with a background pixel based on their alpha (opacity) value.

Each pixel has 4 components:
**R, G, B, A** - red, green, blue and alpha (usually normalized to opacity from 0.0 to 1.0).

### Formula

For each color channel (**R**, **G**, **B**):

```js
out = round(alpha * fg + (1 - alpha) * bg)
```

For the **Alpha** channel itself:

```js
outAlpha = round(alpha * 255 + (1 - alpha) * bgAlpha)
```


from PIL import Image, ImageChops

def trim(im):
    bg = Image.new(im.mode, im.size, (255, 255, 255))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

im = Image.open("public/logo.png")
# Ensure it is RGB
if im.mode != "RGB":
    im = im.convert("RGB")
cropped = trim(im)

# Let's add a small amount of padding (e.g. 20 pixels) to make sure it is not too tight
padding = 20
width, height = cropped.size
new_im = Image.new("RGB", (width + 2*padding, height + 2*padding), (255, 255, 255))
new_im.paste(cropped, (padding, padding))

new_im.save("public/logo.png")
print(f"Logo trimmed and saved successfully! New size: {new_im.size[0]}x{new_im.size[1]}")

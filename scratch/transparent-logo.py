from PIL import Image

def make_transparent(img_path, output_path):
    img = Image.open(img_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # If pixel is very close to white, make it transparent
        if item[0] > 245 and item[1] > 245 and item[2] > 245:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved transparent logo to {output_path}")

make_transparent("public/logo.png", "public/logo.png")

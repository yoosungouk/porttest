from PIL import Image, ImageDraw, ImageFont
import os

# 32x32 크기의 이미지 생성 (표준 favicon 크기)
img = Image.new('RGBA', (32, 32), color=(39, 43, 76, 255))
draw = ImageDraw.Draw(img)

# 원 그리기
draw.ellipse((4, 4, 28, 28), fill=(255, 255, 255, 255))

# 이니셜 "YS" 그리기 - 폰트가 없을 수 있으므로 선으로 그립니다
# "Y" 형태
draw.line((10, 10, 16, 16), fill=(39, 43, 76, 255), width=2)
draw.line((16, 16, 22, 10), fill=(39, 43, 76, 255), width=2)
draw.line((16, 16, 16, 22), fill=(39, 43, 76, 255), width=2)

# "S" 형태 
draw.arc((12, 15, 20, 23), 180, 0, fill=(39, 43, 76, 255), width=2)
draw.arc((12, 19, 20, 27), 0, 180, fill=(39, 43, 76, 255), width=2)

# 이미지 저장
img.save('static/favicon.png')
print("Favicon created at static/favicon.png") 
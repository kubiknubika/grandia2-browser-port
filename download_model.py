import urllib.request
import os

# Я использую открытые (CC0) модели в формате GLB, доступные на GitHub.
# Возьмём модель "Rogue" (разбойник/мечник) из популярного пака KayKit (CC0).
# Это отличная замена Рюдо для прототипа (у него есть меч и анимации).

url = "https://raw.githubusercontent.com/pmndrs/market-assets/main/models/rogue/model.gltf"
os.makedirs("public/assets/models", exist_ok=True)
filename = "public/assets/models/ryudo.glb"

print("Downloading 3D model...")
try:
    urllib.request.urlretrieve(url, filename)
    print("Success! Downloaded rogue model as ryudo.glb")
except Exception as e:
    print(f"Error downloading model: {e}")


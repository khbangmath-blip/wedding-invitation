const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'images', 'main.jpg');
const outputPath = path.join(__dirname, 'public', 'images', 'main-optimized.jpg');
const backupPath = path.join(__dirname, 'public', 'images', 'main-original.jpg');

async function optimizeMainImage() {
  try {
    // 원본 백업
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(inputPath, backupPath);
      console.log('✓ 원본 이미지 백업 완료: main-original.jpg');
    }

    // 이미지 메타데이터 확인
    const metadata = await sharp(inputPath).metadata();
    console.log(`원본 크기: ${metadata.width}x${metadata.height}, ${(fs.statSync(inputPath).size / 1024).toFixed(2)}KB`);

    // 최적화: 너비 1200px로 리사이즈 + 화질 85%로 압축
    await sharp(inputPath)
      .resize(1200, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ 
        quality: 85, 
        progressive: true,
        mozjpeg: true 
      })
      .toFile(outputPath);

    const newSize = fs.statSync(outputPath).size;
    const newMetadata = await sharp(outputPath).metadata();
    console.log(`최적화 후: ${newMetadata.width}x${newMetadata.height}, ${(newSize / 1024).toFixed(2)}KB`);
    console.log(`용량 감소: ${((1 - newSize / fs.statSync(inputPath).size) * 100).toFixed(1)}%`);

    // 최적화된 이미지로 교체
    fs.copyFileSync(outputPath, inputPath);
    fs.unlinkSync(outputPath);
    console.log('✓ main.jpg 최적화 완료!');

  } catch (error) {
    console.error('이미지 최적화 실패:', error);
    process.exit(1);
  }
}

optimizeMainImage();

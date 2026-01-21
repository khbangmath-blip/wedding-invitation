const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG로 이모지 렌더링
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text x="50" y="70" font-size="80" text-anchor="middle" dominant-baseline="central">💐</text>
</svg>`;

const publicDir = path.join(__dirname, 'public');
const svgPath = path.join(__dirname, 'favicon.svg');
const icoPath = path.join(publicDir, 'favicon.ico');

// SVG를 파일로 저장
fs.writeFileSync(svgPath, svg);

// SVG를 PNG로 변환하고 favicon.ico로 저장
(async () => {
  try {
    await sharp(svgPath)
      .png()
      .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(icoPath.replace('.ico', '.png'));

    // PNG를 ico로 이름 변경 (간단한 방법)
    fs.copyFileSync(icoPath.replace('.ico', '.png'), icoPath);
    
    console.log('✅ favicon.ico 생성 완료:', icoPath);
    console.log('📍 위치: public/favicon.ico');
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
})();

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = './public';
const OUTPUT_DIR = './public';

const SIZES = {
  thumb: { width: 150, height: 150 },
  medium: { width: 300, height: 300 },
  large: { width: 600, height: 600 }
};

const QUALITY = {
  webp: 85,
  jpeg: 90
};

async function optimizeImage(inputPath, filename) {
  try {
    const ext = path.extname(filename).toLowerCase();
    const baseName = path.basename(filename, ext);
    
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      console.log(`Skipping ${filename} - unsupported format`);
      return;
    }

    console.log(`Processing ${filename}...`);

    // Create original backup if it doesn't exist
    const originalPath = path.join(OUTPUT_DIR, `${baseName}_original${ext}`);
    if (!fs.existsSync(originalPath)) {
      fs.copyFileSync(inputPath, originalPath);
      console.log(`  ✓ Created backup: ${baseName}_original${ext}`);
    }

    // Generate different sizes
    for (const [sizeName, dimensions] of Object.entries(SIZES)) {
      // WebP version
      const webpPath = path.join(OUTPUT_DIR, `${baseName}_${sizeName}.webp`);
      await sharp(inputPath)
        .resize(dimensions.width, dimensions.height, { 
          fit: 'cover', 
          position: 'center' 
        })
        .webp({ quality: QUALITY.webp })
        .toFile(webpPath);
      
      console.log(`  ✓ Generated WebP ${sizeName}: ${baseName}_${sizeName}.webp`);

      // JPEG version
      const jpegPath = path.join(OUTPUT_DIR, `${baseName}_${sizeName}${ext === '.png' ? '.jpg' : ext}`);
      await sharp(inputPath)
        .resize(dimensions.width, dimensions.height, { 
          fit: 'cover', 
          position: 'center' 
        })
        .jpeg({ quality: QUALITY.jpeg })
        .toFile(jpegPath);
      
      console.log(`  ✓ Generated JPEG ${sizeName}: ${baseName}_${sizeName}${ext === '.png' ? '.jpg' : ext}`);
    }

    // Get file sizes for comparison
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(path.join(OUTPUT_DIR, `${baseName}_medium.webp`)).size;
    const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`  📊 Size reduction: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(optimizedSize / 1024 / 1024).toFixed(2)}MB (${compressionRatio}% smaller)`);
    
  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
  }
}

async function main() {
  try {
    // Check if sharp is installed
    try {
      require.resolve('sharp');
    } catch (e) {
      console.log('Installing sharp...');
      require('child_process').execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    }

    const files = fs.readdirSync(INPUT_DIR);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext) && !file.includes('_thumb') && !file.includes('_medium') && !file.includes('_large') && !file.includes('_original');
    });

    console.log(`Found ${imageFiles.length} images to optimize:`);
    console.log(imageFiles.map(f => `  - ${f}`).join('\n'));
    console.log('');

    for (const file of imageFiles) {
      const inputPath = path.join(INPUT_DIR, file);
      await optimizeImage(inputPath, file);
      console.log('');
    }

    console.log('🎉 All images optimized successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your components to use the OptimizedImage component');
    console.log('2. Replace image references with the new optimized versions');
    console.log('3. Test on different screen sizes to ensure proper loading');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
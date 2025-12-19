const { exec } = require('child_process');

class ExiftoolService {
  async extractMetadata(filePath, exiftoolPath) {
    return new Promise((resolve, reject) => {
      const binary = exiftoolPath && exiftoolPath.trim() ? exiftoolPath.trim() : 'exiftool';
      const command = `${binary} -json -n "${filePath}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`ExifTool error: ${error.message}`));
          return;
        }
        if (stderr && stderr.trim()) {
          // ExifTool 通常将非致命信息输出到 stderr，这里仅在有内容时继续解析
        }
        try {
          const parsed = this.parseMetadata(stdout);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse ExifTool JSON: ${e.message}`));
        }
      });
    });
  }

  parseMetadata(metadataJson) {
    const exif = [];
    const exifDescriptions = {
      'Make': '相机制造商',
      'Model': '相机型号',
      'LensModel': '镜头型号',
      'DateTime': '拍摄日期和时间',
      'ExposureTime': '曝光时间',
      'FNumber': '光圈值',
      'ISO': 'ISO感光度',
      'FocalLength': '焦距',
      'ImageWidth': '图像宽度',
      'ImageHeight': '图像高度',
      'Orientation': '图像方向',
      'GPSLatitude': 'GPS纬度',
      'GPSLongitude': 'GPS经度',
      'Flash': '闪光灯状态',
      'MeteringMode': '测光模式',
      'ExposureProgram': '曝光程序',
      'WhiteBalance': '白平衡',
      'ExposureCompensation': '曝光补偿',
      'SubjectDistance': '拍摄距离',
      'DigitalZoomRatio': '数字变焦比',
      'FocalLengthIn35mmFormat': '35mm等效焦距',
      'SceneCaptureType': '场景捕获类型',
      'Contrast': '对比度',
      'Saturation': '饱和度',
      'Sharpness': '锐度',
      'DateTimeOriginal': '原始拍摄时间',
      'DateTimeDigitized': '数字化时间',
      'SubSecTime': '子秒时间',
      'SubSecTimeOriginal': '原始子秒时间',
      'SubSecTimeDigitized': '数字化子秒时间',
      'GPSAltitude': 'GPS海拔高度',
      'GPSAltitudeRef': 'GPS海拔高度参考',
      'GPSTimeStamp': 'GPS时间戳',
      'GPSDateStamp': 'GPS日期戳',
      'GPSProcessingMethod': 'GPS处理方法',
      'GPSAreaInformation': 'GPS区域信息',
      'GPSDifferential': 'GPS差分'
    };

    try {
      const arr = JSON.parse(metadataJson);
      const obj = Array.isArray(arr) ? arr[0] || {} : {};

      // 宽高统一映射（部分格式宽高键名可能不同）
      if (obj.ImageWidth !== undefined) {
        exif.push({ name: 'ImageWidth', value: obj.ImageWidth, description: exifDescriptions['ImageWidth'] });
      } else if (obj.PixelXDimension !== undefined) {
        exif.push({ name: 'ImageWidth', value: obj.PixelXDimension, description: exifDescriptions['ImageWidth'] });
      }

      if (obj.ImageHeight !== undefined) {
        exif.push({ name: 'ImageHeight', value: obj.ImageHeight, description: exifDescriptions['ImageHeight'] });
      } else if (obj.PixelYDimension !== undefined) {
        exif.push({ name: 'ImageHeight', value: obj.PixelYDimension, description: exifDescriptions['ImageHeight'] });
      }

      // 遍历所有键值，统一入表
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (value === undefined || value === null) return;
        // 已处理的宽高避免重复添加
        if (key === 'ImageWidth' || key === 'ImageHeight' || key === 'PixelXDimension' || key === 'PixelYDimension') return;
        exif.push({ name: key, value: value, description: exifDescriptions[key] || '' });
      });

      // 去重（保留最后一次出现的属性）
      const unique = [];
      const seen = new Set();
      for (let i = exif.length - 1; i >= 0; i--) {
        if (!seen.has(exif[i].name)) {
          seen.add(exif[i].name);
          unique.unshift(exif[i]);
        }
      }
      return unique;
    } catch (error) {
      return [];
    }
  }
}

module.exports = new ExiftoolService();


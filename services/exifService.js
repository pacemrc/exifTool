const exiftoolService = require('./exiftoolService');
const exifParser = require('exif-parser');
const fs = require('fs');
const path = require('path');

class ExifService {
  async extractExifFromFile(filePath, exittoolConfig) {
    try {
      // 获取文件扩展名
      const fileExt = path.extname(filePath).toLowerCase();
      
      // 检查是否是RAW格式文件
      const rawExtensions = ['.cr2', '.cr3', '.nef', '.raw', '.arw', '.sr2', '.srf', '.rw2', '.pef', '.orf', '.raf', '.dng', '.dcr', '.k25', '.kdc', '.mrw', '.x3f'];
      const isRawFile = rawExtensions.includes(fileExt);
      
      let exifData = [];
      let extractionMethod = '';
      
      // 非RAW格式文件，先尝试使用exif-parser提取
      if (!isRawFile) {
        try {
          exifData = await this.extractExifWithParser(filePath);
          extractionMethod = 'exif-parser';
        } catch (parserError) {
          console.error('exif-parser extraction failed, falling back to ExifTool:', parserError.message);
          // exif-parser失败，使用ExifTool
          exifData = await exiftoolService.extractMetadata(
            filePath,
            exittoolConfig.path
          );
          extractionMethod = 'exiftool';
        }
      } else {
        // RAW格式文件直接使用ExifTool
        exifData = await exiftoolService.extractMetadata(
          filePath,
          exittoolConfig.path
        );
        extractionMethod = 'exiftool';
      }
      
      // 如果没有提取到EXIF数据，添加基本文件信息
      if (exifData.length === 0) {
        exifData = this.getBasicFileInfo(filePath);
        // 添加提取失败的标记
        exifData.push({
          name: 'ExtractionStatus',
          value: 'Failed',
          description: `${extractionMethod}未能提取到EXIF数据，仅返回基本文件信息`
        });
      } else {
        // 添加提取成功的标记
        exifData.push({
          name: 'ExtractionStatus',
          value: 'Success',
          description: `${extractionMethod}成功提取到EXIF数据`
        });
      }
      
      return exifData;
    } catch (error) {
      console.error('EXIF extraction error:', error);
      
      // 出错时返回基本文件信息和错误详情
      const basicInfo = this.getBasicFileInfo(filePath);
      basicInfo.push({
        name: 'ExtractionStatus',
        value: 'Error',
        description: `提取失败: ${error.message}`
      });
      
      return basicInfo;
    }
  }
  
  // 使用exif-parser库提取EXIF数据
  async extractExifWithParser(filePath) {
    return new Promise((resolve, reject) => {
      try {
        // 读取文件内容
        const buffer = fs.readFileSync(filePath);
        
        // 创建解析器
        const parser = exifParser.create(buffer);
        
        // 解析EXIF数据
        const result = parser.parse();
        
        const exif = [];
        
        // EXIF属性说明映射
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
        
        // 提取tags中的EXIF数据
        if (result.tags) {
          for (const [key, value] of Object.entries(result.tags)) {
            // 跳过缩略图等不需要的信息
            if (key !== 'Thumbnail' && value !== undefined && value !== null) {
              exif.push({
                name: key,
                value: value,
                description: exifDescriptions[key] || ''
              });
            }
          }
        }
        
        // 提取GPS信息
        if (result.gps) {
          exif.push({
            name: 'GPSLatitude',
            value: `${result.gps.latitude}`,
            description: exifDescriptions['GPSLatitude']
          });
          exif.push({
            name: 'GPSLongitude',
            value: `${result.gps.longitude}`,
            description: exifDescriptions['GPSLongitude']
          });
          if (result.gps.altitude) {
            exif.push({
              name: 'GPSAltitude',
              value: `${result.gps.altitude}`,
              description: exifDescriptions['GPSAltitude']
            });
          }
        }
        
        resolve(exif);
      } catch (error) {
        reject(new Error(`exif-parser error: ${error.message}`));
      }
    });
  }
  
  getBasicFileInfo(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const fileName = path.basename(filePath);
      
      return [
        { name: 'FileName', value: fileName, description: '文件名' },
        { name: 'FileSize', value: (stats.size / 1024).toFixed(2) + ' KB', description: '文件大小' },
        { name: 'LastModified', value: stats.mtime.toISOString(), description: '最后修改时间' },
        { name: 'FilePath', value: filePath, description: '文件路径' }
      ];
    } catch (error) {
      console.error('Failed to get basic file info:', error);
      return [];
    }
  }
}

module.exports = new ExifService();

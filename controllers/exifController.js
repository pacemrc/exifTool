const path = require('path');
const fs = require('fs');
const exifService = require('../services/exifService');

class ExifController {
  /**
   * 查询路径的控制器方法
   */
  async queryPath(req, res) {
    try {
      // 从请求头获取ExifTool配置
      const exittoolConfig = {
        path: req.headers['x-exiftool-path'] || req.headers['x-exittool-path'] || ''
      };
      
      // 获取请求体中的路径
      const { path: requestedPath } = req.body;
      
      if (!requestedPath) {
        return res.status(400).json({
          success: false,
          message: 'Path is required'
        });
      }
      
      // 验证路径安全性
      if (!this.isPathSafe(requestedPath)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid path'
        });
      }
      
      // 检查路径是否存在
      if (!fs.existsSync(requestedPath)) {
        return res.status(404).json({
          success: false,
          message: 'Path not found'
        });
      }
      
      const results = [];
      
      // 获取路径状态
      const stats = fs.statSync(requestedPath);
      
      if (stats.isFile()) {
        // 处理单个文件
        await this.processSingleFile(requestedPath, exittoolConfig, results);
      } else if (stats.isDirectory()) {
        // 处理文件夹
        await this.processDirectory(requestedPath, exittoolConfig, results);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Path is not a file or directory'
        });
      }
      
      // 返回成功响应
      res.json({
        success: true,
        data: results,
        exportFilename: stats.isDirectory() 
          ? path.basename(requestedPath) 
          : path.basename(requestedPath, path.extname(requestedPath)),
        message: `Successfully processed ${results.filter(r => r.success).length} out of ${results.length} files`
      });
    } catch (error) {
      console.error('Controller error:', error);
      
      // 返回错误响应
      res.status(500).json({
        success: false,
        error: `Internal server error: ${error.message}`
      });
    }
  }
  
  /**
   * 处理单个文件
   */
  async processSingleFile(filePath, exittoolConfig, results) {
    try {
      // 检查文件扩展名是否为图片格式
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.tiff', '.heic', '.cr2', '.cr3', '.nef', '.raw', '.arw', '.sr2', '.srf', '.rw2', '.pef', '.orf', '.raf', '.dng', '.dcr', '.k25', '.kdc', '.mrw', '.x3f'];
      const ext = path.extname(filePath).toLowerCase();
      
      if (!allowedExtensions.includes(ext)) {
        results.push({
          fileName: path.basename(filePath),
          exifData: [],
          success: false,
          error: 'Not a supported image format'
        });
        return;
      }
      
      // 调用EXIF服务提取数据
      const exifData = await exifService.extractExifFromFile(filePath, exittoolConfig);
      
      results.push({
        fileName: path.basename(filePath),
        exifData: exifData,
        success: true
      });
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
      
      results.push({
        fileName: path.basename(filePath),
        exifData: [],
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * 处理文件夹
   */
  async processDirectory(dirPath, exittoolConfig, results) {
    try {
      // 读取文件夹中的所有文件
      const files = fs.readdirSync(dirPath);
      
      // 遍历所有文件
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        
        try {
          const stats = fs.statSync(filePath);
          
          if (stats.isFile()) {
            // 处理单个文件
            await this.processSingleFile(filePath, exittoolConfig, results);
          }
        } catch (error) {
          console.error(`Error processing file ${filePath}:`, error);
          
          results.push({
            fileName: file,
            exifData: [],
            success: false,
            error: error.message
          });
        }
      }
    } catch (error) {
      console.error(`Error processing directory ${dirPath}:`, error);
      
      results.push({
        fileName: path.basename(dirPath),
        exifData: [],
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * 验证路径安全性
   */
  isPathSafe(filePath) {
    // 防止路径遍历攻击
    const normalizedPath = path.normalize(filePath);
    
    // 检查是否包含路径遍历字符
    if (normalizedPath.includes('..')) {
      return false;
    }
    
    // 检查是否是绝对路径
    if (!path.isAbsolute(normalizedPath)) {
      return false;
    }
    
    // 检查是否包含危险字符
    const dangerousChars = [';', '&', '|', '<', '>', '`', '$(', '${'];
    for (const char of dangerousChars) {
      if (normalizedPath.includes(char)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 获取目录列表
   */
  async getDirectoryList(req, res) {
    try {
      const { directoryPath } = req.query;
      
      // 默认显示根目录
      let dirPath = directoryPath || '/';
      
      // 验证路径安全性
      if (!this.isPathSafe(dirPath)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid path'
        });
      }
      
      // 检查路径是否存在
      if (!fs.existsSync(dirPath)) {
        return res.status(404).json({
          success: false,
          message: 'Directory not found'
        });
      }
      
      // 检查是否是目录
      const stats = fs.statSync(dirPath);
      if (!stats.isDirectory()) {
        return res.status(400).json({
          success: false,
          message: 'Path is not a directory'
        });
      }
      
      // 读取目录内容
      const files = fs.readdirSync(dirPath);
      
      // 处理目录内容
      const directoryItems = [];
      
      // 添加上级目录
      if (dirPath !== '/') {
        directoryItems.push({
          name: '..',
          path: path.dirname(dirPath),
          isDirectory: true,
          size: 0,
          mtime: 0
        });
      }
      
      // 添加当前目录内容
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        try {
          const fileStats = fs.statSync(filePath);
          directoryItems.push({
            name: file,
            path: filePath,
            isDirectory: fileStats.isDirectory(),
            size: fileStats.size,
            mtime: fileStats.mtime.getTime()
          });
        } catch (error) {
          console.error(`Error getting stats for ${filePath}:`, error);
          // 跳过无法访问的文件
          continue;
        }
      }
      
      // 按类型和名称排序
      directoryItems.sort((a, b) => {
        // 目录排在前面
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        // 按名称排序
        return a.name.localeCompare(b.name);
      });
      
      return res.json({
        success: true,
        data: directoryItems,
        currentPath: dirPath
      });
    } catch (error) {
      console.error('Directory list error:', error);
      return res.status(500).json({
        success: false,
        message: `Internal server error: ${error.message}`
      });
    }
  }

  async validateExecutablePath(req, res) {
    try {
      const { path: execPath } = req.body;
      if (!execPath) {
        return res.status(400).json({ success: false, message: '路径格式不正确：缺少路径' });
      }
      if (!this.isPathSafe(execPath)) {
        return res.status(400).json({ success: false, message: '路径格式不正确' });
      }
      if (!fs.existsSync(execPath)) {
        return res.status(404).json({ success: false, message: '文件不存在' });
      }
      const stats = fs.statSync(execPath);
      if (!stats.isFile()) {
        return res.status(400).json({ success: false, message: '路径指向的不是文件' });
      }
      try {
        fs.accessSync(execPath, fs.constants.X_OK);
      } catch (e) {
        // 在不支持 X_OK 的平台上，退化为可读性检查
        try {
          fs.accessSync(execPath, fs.constants.R_OK);
        } catch (e2) {
          return res.status(403).json({ success: false, message: '文件不可访问' });
        }
      }
      return res.json({ success: true, message: '路径验证通过' });
    } catch (error) {
      console.error('Validate path error:', error);
      return res.status(500).json({ success: false, message: `内部错误：${error.message}` });
    }
  }
}

module.exports = new ExifController();

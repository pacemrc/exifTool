const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const exifController = require('./controllers/exifController');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// 创建Express应用
const app = express();

// 设置端口与静态目录（开发默认3000，生产未指定时使用随机可用端口）
const isDev = process.env.NODE_ENV === 'development';
const STATIC_DIR = process.env.STATIC_DIR
  ? path.join(__dirname, '../../', process.env.STATIC_DIR)
  : (isDev ? path.join(__dirname, '../../src/frontend') : path.join(__dirname, '../../dist'));
const RUN_DIR = process.env.RUN_DIR ? path.join(__dirname, '../../', process.env.RUN_DIR) : path.join(__dirname, '../../run');
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (isDev ? 3000 : 0);

// 配置CORS中间件，从环境变量中读取允许的来源
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    // 允许请求不带Origin头的情况（如curl请求）
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-ExifTool-Path', 'X-ExitTool-Path', 'X-OS-Type']
}));

// 配置JSON解析中间件
app.use(express.json());

// 配置URL编码中间件
app.use(express.urlencoded({ extended: true }));

app.use(express.static(STATIC_DIR));

// 已移除通过配置文件的前端配置输出，前端默认与当前域名同源使用 /api

// 配置路径查询API路由
app.post('/api/exif/query-path', 
  (req, res) => exifController.queryPath(req, res)
);

// 配置目录列表API路由
app.get('/api/file-system/browse', 
  (req, res) => exifController.getDirectoryList(req, res)
);

// 系统路径校验（ExifTool可执行文件路径）
app.post('/api/system/validate-path',
  (req, res) => exifController.validateExecutablePath(req, res)
);

app.get('/', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

// 配置404处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// 配置全局错误处理
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// 启动服务器
const server = app.listen(PORT, () => {
  const actualPort = server.address().port;
  console.log(`\n🚀 Server running on http://localhost:${actualPort}`);
  console.log(`📁 Static files served from: ${STATIC_DIR}`);
  console.log(`📡 API endpoint: http://localhost:${actualPort}/api/exif/query-path`);
  console.log(`🔧 Metadata extractor: ExifTool`);
  console.log('\nPress Ctrl+C to stop the server\n');
});

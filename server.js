const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const exifController = require('./controllers/exifController');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 创建Express应用
const app = express();

// 设置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 设置端口与静态目录
const STATIC_DIR = path.join(__dirname, 'public');
const RUN_DIR = process.env.RUN_DIR ? path.join(__dirname, process.env.RUN_DIR) : path.join(__dirname, 'run');
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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

// 静态文件服务
app.use(express.static(STATIC_DIR));

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

// 根路径渲染模板
app.get('/', (req, res) => {
  res.render('index');
});

// 配置404处理
app.use((req, res) => {
  if (req.accepts('html')) {
    res.status(404).render('index');
  } else {
    res.status(404).json({ success: false, message: 'Route not found' });
  }
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
  console.log('\nPress Ctrl+C to stop the server\n');
});

# EXIF元数据解析工具

## 项目概述

EXIF元数据解析工具是一款用于提取和管理图像EXIF元数据的Web应用，支持多种图像格式，包括JPEG、PNG、TIFF、HEIC以及各种RAW格式（如CR2、CR3、NEF等）。

## 功能特性

- 📁 **图形化文件浏览**：直观浏览本地文件系统，选择文件或文件夹
- 📷 **多格式支持**：支持JPEG、PNG、TIFF、HEIC及多种RAW格式
- 🚀 **智能提取引擎**：结合exif-parser和ExifTool，兼顾性能和准确性
- 📊 **分类过滤**：按常用属性、高级属性、其他属性分类筛选
- 📋 **数据展示**：响应式表格设计，支持分页和排序
- 💾 **CSV导出**：将EXIF数据导出为CSV格式，便于进一步分析
- 🌓 **主题切换**：支持深色/浅色模式切换，适应不同使用环境
- ⚙️ **灵活配置**：支持自定义ExifTool路径，优化高级格式提取

## 技术栈

| 类别 | 技术/框架 | 版本 |
|------|-----------|------|
| 后端 | Node.js | 14.x+ |
| 后端 | Express.js | ^4.21.1 |
| EXIF解析 | exif-parser | ^0.1.12 |
| 高级EXIF解析 | ExifTool | - |
| 前端 | HTML/CSS/JavaScript | - |
| 构建工具 | Vite | ^7.2.6 |
| 跨域支持 | cors | ^2.8.5 |
| 环境管理 | dotenv | ^17.2.3 |

## 快速开始

### 环境要求

- Node.js 14.x 或更高版本
- npm 或 yarn
- ExifTool（可选，用于高级格式EXIF提取）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <项目仓库地址>
   cd exifTool
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   ```
   根据需要修改`.env`文件中的配置项

4. **启动开发服务器（前后端一体）**
   ```bash
   npm run dev
   ```
   - 访问地址：http://localhost:3000
   - 前端静态文件通过后端Express服务器提供
   - 适合完整功能测试和开发

5. **单独运行前端开发服务器（仅前端）**
   ```bash
   # 安装Vite（如果尚未安装）
   npm install -g vite
   
   # 进入前端目录
   cd src/frontend
   
   # 启动Vite开发服务器
   vite
   ```
   - 访问地址：http://localhost:5173
   - 仅运行前端服务，不包含后端API
   - 适合前端开发和调试，需要配合后端服务器使用

6. **生产环境部署**
   ```bash
   npm run build       # 构建生产版本
   npm run prod        # 启动生产服务器
   ```
   - 访问地址：http://localhost:8000
   - 前端静态文件通过后端Express服务器提供
   - 适合正式部署使用

## 使用指南

### 基本使用流程

1. **启动应用**
   - 确保服务器已启动
   - 在浏览器中访问应用地址

2. **选择文件或文件夹**
   - 方法一：直接在输入框中输入文件或文件夹路径
   - 方法二：点击"浏览"按钮，使用图形化文件浏览器选择

3. **执行EXIF提取**
   - 点击"解析"按钮开始提取EXIF数据
   - 等待提取完成，进度条会显示处理进度

4. **查看提取结果**
   - 提取完成后，左侧会显示文件列表
   - 点击文件名可查看该文件的EXIF数据
   - 右侧表格显示EXIF属性名称和值

### 高级功能

#### 配置ExifTool

1. 点击"ExifTool配置"按钮
2. 输入ExifTool可执行文件的完整路径
3. 选择操作系统类型
4. 点击"验证"按钮检查路径是否正确
5. 点击"保存配置"按钮保存设置

#### 导出CSV

1. 在"选择查询属性"区域，勾选您想要导出的EXIF属性
2. 点击"导出CSV"按钮
3. 系统会生成包含所选属性的CSV文件，并自动下载

#### 主题切换

- 点击"切换深色模式"按钮，可以在浅色和深色模式之间切换
- 系统会记住您的偏好设置

## 项目结构

```
exifTool/
├── src/
│   ├── backend/              # 后端代码
│   │   ├── controllers/      # 控制器
│   │   ├── services/         # 服务层
│   │   └── server.js         # 主服务器文件
│   └── frontend/             # 前端代码
│       ├── scripts/          # JavaScript文件
│       ├── styles/           # CSS样式
│       └── index.html        # 主HTML文件
├── .env                      # 环境变量配置
├── .env.example              # 环境变量示例
├── .gitignore                # Git忽略规则
├── package.json              # 项目配置和依赖
├── package-lock.json         # 依赖锁定文件
└── vite.config.mjs           # Vite配置
```

## API接口

### 主要API端点

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/exif/query-path | 查询文件或文件夹的EXIF数据 |
| GET | /api/file-system/browse | 获取目录列表 |
| POST | /api/system/validate-path | 验证ExifTool可执行文件路径 |

## 开发指南

### 代码规范

- 后端使用CommonJS模块系统
- 前端使用ES模块系统
- 建议使用ESLint和Prettier保持代码风格一致

### 调试模式

- 开发环境下，控制台会输出详细的调试信息
- 可以通过修改环境变量`NODE_ENV`来切换运行环境

## 常见问题

### Q: 为什么有些文件无法提取EXIF数据？
A: 可能原因包括：文件格式不支持、文件损坏、没有EXIF数据。建议安装ExifTool以提高RAW格式文件的提取成功率。

### Q: 如何提高RAW格式文件的EXIF提取成功率？
A: 安装并配置ExifTool，系统会自动优先使用ExifTool提取RAW格式文件的EXIF数据。

### Q: 为什么导出的CSV文件中文显示乱码？
A: 建议使用支持UTF-8编码的文本编辑器或电子表格软件打开，如Notepad++、Excel等。

## 技术支持

- **项目主页**：<项目GitHub地址>
- **Issue跟踪**：<项目GitHub Issues地址>
- **贡献代码**：欢迎提交Pull Request

## 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 更新日志

详见CHANGELOG.md文件。
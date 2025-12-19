# ExifReader - EXIF数据提取工具

## 项目简介

ExifReader是一个用于提取和查看图像EXIF数据的Web应用，支持多种图像格式，包括标准格式和RAW格式。

## 技术栈

- **后端**: Node.js + Express
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **模板引擎**: EJS
- **EXIF提取**: exif-parser库 + ExifTool命令行工具

## 功能特性

1. **文件系统浏览**: 直接在浏览器中浏览服务器文件系统
2. **单文件/批量处理**: 支持单个文件和目录批量处理
3. **多种图像格式支持**: 
   - 标准格式: JPEG, PNG, TIFF, HEIC
   - RAW格式: CR2, CR3, NEF, RAW, ARW等
4. **EXIF属性过滤**: 可选择要显示的EXIF属性
5. **CSV数据导出**: 支持将EXIF数据导出为CSV文件
6. **ExifTool配置**: 可自定义ExifTool可执行文件路径
7. **深色/浅色主题切换**: 支持主题切换
8. **处理进度显示**: 实时显示文件处理进度

## 项目结构

```
exifTool/
├── controllers/          # 控制器层
│   └── exifController.js # 主要业务逻辑控制器
├── public/               # 前端静态资源
│   ├── scripts/          # JavaScript文件
│   └── styles/           # CSS样式文件
├── services/             # 服务层
│   ├── exifService.js    # EXIF数据提取服务
│   └── exiftoolService.js # ExifTool命令行工具服务
├── views/                # EJS模板文件
│   └── index.ejs         # 主页面模板
├── .env.example          # 环境变量示例
├── package.json          # 项目配置和依赖
└── server.js             # 服务器入口文件
```

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制环境变量示例文件并根据需要修改：

```bash
cp .env.example .env
```

环境变量说明：

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `PORT` | 服务器端口 | 3000 |
| `RUN_DIR` | 运行目录 | 项目根目录下的`run`目录 |
| `ALLOWED_ORIGINS` | 允许的跨域来源 | http://localhost:3000 |

### 3. 启动服务器

开发环境：

```bash
npm run dev
```

生产环境：

```bash
npm run prod
```

### 4. 访问应用

在浏览器中访问：`http://localhost:3000`

## 使用指南

### 1. 配置ExifTool（可选）

对于RAW格式文件，需要配置ExifTool可执行文件路径：

1. 点击页面右上角的"ExifTool配置"按钮
2. 在弹出的配置窗口中输入ExifTool可执行文件路径
3. 点击"验证"按钮验证路径是否有效
4. 点击"保存配置"完成配置

### 2. 选择文件或目录

#### 方法一：直接输入路径

在"指定路径"输入框中直接输入文件或目录路径，然后点击"解析"按钮。

#### 方法二：使用文件浏览器

1. 点击"浏览"按钮打开文件浏览器
2. 导航到目标文件或目录
3. 选择文件或目录
4. 点击"选择"按钮
5. 点击"解析"按钮开始提取EXIF数据

### 3. 查看和过滤EXIF数据

1. 在"选择查询属性"部分，勾选要显示的EXIF属性
2. 可以按类别选择（常用属性、高级属性、其他属性）
3. 点击文件列表中的文件名查看对应EXIF数据
4. 表格将显示所选文件的EXIF数据

### 4. 导出EXIF数据

1. 确保已显示要导出的EXIF数据
2. 点击页面右上角的"导出CSV"按钮
3. 选择保存位置，完成导出


## 注意事项

1. **安全性**: 系统实施了路径验证，防止路径遍历攻击
2. **性能**: 处理大量文件时可能需要较长时间
3. **RAW格式**: RAW格式文件需要正确配置ExifTool路径
4. **跨域配置**: 生产环境建议明确配置ALLOWED_ORIGINS，不要使用默认值`*`
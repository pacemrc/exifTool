// 从Vite环境变量中读取API基础URL，只允许完整URL配置
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 初始化API基础URL
let apiBaseUrl = '';

// 验证API基础URL是否为完整URL
function validateApiUrl(url) {
  if (!url) {
    throw new Error('VITE_API_BASE_URL is required in .env file');
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('VITE_API_BASE_URL must be a complete URL with http:// or https:// protocol');
  }
  return url;
}

export async function initAppConfig() {
  // 验证并设置API基础URL
  apiBaseUrl = validateApiUrl(VITE_API_BASE_URL);
}

export function getApiBaseUrl() {
  // 如果还未初始化，先初始化
  if (!apiBaseUrl) {
    apiBaseUrl = validateApiUrl(VITE_API_BASE_URL);
  }
  return apiBaseUrl;
}

// 初始化API基础URL
let apiBaseUrl = '';

// 从服务端注入的配置中获取API基础URL
export async function initAppConfig() {
  // 使用服务端注入的配置
  apiBaseUrl = window.appConfig.apiBaseUrl;
}

export function getApiBaseUrl() {
  // 如果还未初始化，从服务端注入的配置中获取
  if (!apiBaseUrl) {
    apiBaseUrl = window.appConfig.apiBaseUrl;
  }
  return apiBaseUrl;
}

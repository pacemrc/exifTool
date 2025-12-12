import { showMessage } from '../components/ui.js';
import { getApiBaseUrl } from './appConfig.js';

export let exittoolConfig = {};
export let isDarkMode = false;

export function loadConfig() {
  const saved = localStorage.getItem('exittoolConfig');
  if (saved) {
    exittoolConfig = JSON.parse(saved);
    const p = document.getElementById('exittool-path');
    const os = document.getElementById('os-select');
    if (p) p.value = exittoolConfig.path || '';
    if (os) os.value = exittoolConfig.os || 'windows';
  }
  isDarkMode = localStorage.getItem('darkMode') === 'true';
}

export function initializeTheme() {
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    const t = document.getElementById('theme-toggle');
    if (t) t.textContent = '切换浅色模式';
  }
}

export function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode);
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) toggleBtn.textContent = isDarkMode ? '切换浅色模式' : '切换深色模式';
}

export function saveExifToolConfig(e) {
  e.preventDefault();
  const path = document.getElementById('exittool-path').value;
  const os = document.getElementById('os-select').value;
  exittoolConfig = { path, os };
  localStorage.setItem('exittoolConfig', JSON.stringify(exittoolConfig));
  showExifToolStatus('保存成功', 'success');
}

export async function testExifToolPath() {
  try {
    const p = document.getElementById('exittool-path').value.trim();
    if (!p) {
      showExifToolStatus('路径格式不正确：缺少路径', 'error');
      return;
    }
    const resp = await fetch(`${getApiBaseUrl()}/system/validate-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: p })
    });
    const result = await resp.json();
    if (result.success) showExifToolStatus('验证通过', 'success');
    else showExifToolStatus(result.message || '验证失败', 'error');
  } catch (e) {
    showExifToolStatus(`验证失败：${e.message}`, 'error');
  }
}

export function showExifToolStatus(message, type) {
  const statusDiv = document.getElementById('exittool-status');
  if (!statusDiv) return;
  statusDiv.textContent = message;
  statusDiv.className = `status-message ${type}`;
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = 'status-message';
  }, 3000);
}

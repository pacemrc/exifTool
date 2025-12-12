import { loadConfig, initializeTheme, saveExifToolConfig, testExifToolPath, toggleTheme } from './config.js';
import { initializeFileBrowser, openFileBrowser } from '../components/fileBrowser.js';
import { setupCategoryFilters, expandAllCategories, collapseAllCategories, selectedProps } from '../components/filters.js';
import { preCountFiles, queryPath } from '../api/api.js';
import { startProgress, finishProgress } from '../components/progress.js';
import { setFiles, displayFileList, displayExifData, changePage, sortTable, getFiles } from '../utils/view.js';
import { exportToCSV } from '../utils/csvExport.js';
import { showMessage } from '../components/ui.js';
import { initAppConfig } from './appConfig.js';

let parseStatus = null;

async function initializeApp() {
  await initAppConfig();
  loadConfig();
  initializeTheme();
  initializeFileBrowser();
  setupEventListeners();
  setupCategoryFilters();
}

function setupEventListeners() {
  const settingsModal = document.getElementById('settings-modal');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsCloseBtn = settingsModal.querySelector('.close');
  settingsBtn.addEventListener('click', () => settingsModal.style.display = 'block');
  settingsCloseBtn.addEventListener('click', () => settingsModal.style.display = 'none');
  document.getElementById('exittool-form').addEventListener('submit', saveExifToolConfig);
  document.getElementById('test-exittool').addEventListener('click', testExifToolPath);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  const pathInput = document.getElementById('path-input');
  const browsePathBtn = document.getElementById('browse-path-btn');
  const queryPathBtn = document.getElementById('query-path-btn');
  queryPathBtn.addEventListener('click', onQueryPath);
  pathInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') onQueryPath(); });
  browsePathBtn.addEventListener('click', () => openFileBrowser());
  const expandAllBtn = document.getElementById('expand-all');
  const collapseAllBtn = document.getElementById('collapse-all');
  if (expandAllBtn) expandAllBtn.addEventListener('click', expandAllCategories);
  if (collapseAllBtn) collapseAllBtn.addEventListener('click', collapseAllCategories);
  document.getElementById('export-csv').addEventListener('click', () => exportToCSV(getFiles(), selectedProps));
  document.getElementById('prev-page').addEventListener('click', () => changePage(-1));
  document.getElementById('next-page').addEventListener('click', () => changePage(1));
  document.querySelectorAll('#exif-table th').forEach(th => { th.addEventListener('click', () => sortTable(th.cellIndex)); });
  parseStatus = document.getElementById('parse-status');
}

async function onQueryPath() {
  const path = document.getElementById('path-input').value.trim();
  if (!path) { showMessage('请输入文件或文件夹路径', 'error'); return; }
  const totalFiles = await preCountFiles(path);
  const timer = startProgress(totalFiles);
  try {
    const result = await queryPath(path);
    if (result.success) {
      const files = result.data.map(item => ({ name: item.fileName, exifData: item.exifData }));
      setFiles(files);
      if (parseStatus) parseStatus.textContent = `已加载 ${files.length} 个文件`;
      displayFileList();
      if (files.length > 0) displayExifData(0);
      showMessage(`成功查询到 ${result.data.length} 个文件`, 'success');
      finishProgress(result.data.length, totalFiles, timer);
    } else {
      showMessage(`查询失败: ${result.message || '未知错误'}`, 'error');
      finishProgress(0, totalFiles, timer);
    }
  } catch (error) {
    showMessage(`路径查询失败: ${error.message}`, 'error');
    finishProgress(0, totalFiles, timer);
  }
}

document.addEventListener('DOMContentLoaded', initializeApp);

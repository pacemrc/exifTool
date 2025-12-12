import { browseDirectory } from '../api/api.js';

let currentDirectory = '/';
let selectedFilePath = null;
let fileBrowserModal = null;
let fileItemsContainer = null;
let selectBtn = null;
let currentPathElement = null;

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function initializeFileBrowser() {
  fileBrowserModal = document.getElementById('file-browser-modal');
  fileItemsContainer = document.getElementById('file-items');
  selectBtn = document.getElementById('select-btn');
  currentPathElement = document.getElementById('file-browser-path');
  const closeBtn = fileBrowserModal.querySelector('.close');
  const refreshBtn = document.getElementById('refresh-btn');
  const browsePathBtn = document.getElementById('browse-path-btn');
  closeBtn.addEventListener('click', closeFileBrowser);
  window.addEventListener('click', (e) => { if (e.target === fileBrowserModal) closeFileBrowser(); });
  refreshBtn.addEventListener('click', () => loadDirectoryList(currentDirectory));
  browsePathBtn.addEventListener('click', openFileBrowser);
  selectBtn.addEventListener('click', selectFilePath);
}

export function openFileBrowser() {
  selectedFilePath = null;
  selectBtn.disabled = true;
  fileBrowserModal.style.display = 'block';
  loadDirectoryList('/');
}

export function closeFileBrowser() {
  fileBrowserModal.style.display = 'none';
}

export async function loadDirectoryList(directoryPath) {
  currentDirectory = directoryPath;
  currentPathElement.textContent = directoryPath;
  const result = await browseDirectory(directoryPath);
  if (result.success) renderDirectoryList(result.data);
}

function renderDirectoryList(items) {
  fileItemsContainer.innerHTML = '';
  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = `file-item-entry ${item.isDirectory ? 'directory' : 'file'}`;
    itemElement.addEventListener('click', () => handleFileItemClick(item));
    const iconElement = document.createElement('div');
    iconElement.className = 'file-item-icon';
    iconElement.textContent = item.isDirectory ? '📁' : '📄';
    const nameElement = document.createElement('div');
    nameElement.className = 'file-item-name';
    nameElement.textContent = item.name;
    const sizeElement = document.createElement('div');
    sizeElement.className = 'file-item-size';
    if (!item.isDirectory) sizeElement.textContent = formatFileSize(item.size);
    const mtimeElement = document.createElement('div');
    mtimeElement.className = 'file-item-mtime';
    if (!item.isDirectory) mtimeElement.textContent = new Date(item.mtime).toLocaleString();
    itemElement.appendChild(iconElement);
    itemElement.appendChild(nameElement);
    itemElement.appendChild(sizeElement);
    itemElement.appendChild(mtimeElement);
    fileItemsContainer.appendChild(itemElement);
  });
}

function handleFileItemClick(item) {
  if (item.isDirectory) loadDirectoryList(item.path);
  else selectFile(item);
}

function selectFile(item) {
  fileItemsContainer.querySelectorAll('.file-item-entry').forEach(entry => entry.classList.remove('selected'));
  const currentEntry = Array.from(fileItemsContainer.children).find(child => {
    const nameElement = child.querySelector('.file-item-name');
    return nameElement && nameElement.textContent === item.name;
  });
  if (currentEntry) {
    currentEntry.classList.add('selected');
    selectedFilePath = item.path;
    selectBtn.disabled = false;
  }
}

function selectFilePath() {
  if (selectedFilePath) {
    document.getElementById('path-input').value = selectedFilePath;
    closeFileBrowser();
  }
}

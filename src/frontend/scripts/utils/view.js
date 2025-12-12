import { exifDescriptions } from '../core/constants.js';
import { selectedProps } from '../components/filters.js';

let currentFiles = [];
let currentFileIndex = 0;
let exifData = [];
let filteredExifData = [];
let currentPage = 1;
const itemsPerPage = 20;

export function setFiles(files) {
  currentFiles = files || [];
  currentFileIndex = 0;
}

export function displayFileList() {
  const fileList = document.getElementById('file-list');
  fileList.innerHTML = '';
  currentFiles.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = `file-item ${index === currentFileIndex ? 'active' : ''}`;
    fileItem.textContent = file.name;
    fileItem.addEventListener('click', () => {
      currentFileIndex = index;
      displayFileList();
      displayExifData(index);
    });
    fileList.appendChild(fileItem);
  });
}

export function displayExifData(fileIndex) {
  const file = currentFiles[fileIndex];
  exifData = (file && file.exifData) || [];
  filterExifData();
  const noExif = document.getElementById('no-exif');
  const noFiles = document.getElementById('no-files');
  const tableContainer = document.getElementById('exif-table-container');
  if (currentFiles.length === 0) {
    noFiles.style.display = 'block';
    noExif.style.display = 'none';
    tableContainer.style.display = 'block';
    document.getElementById('exif-table').style.display = 'none';
  } else if (exifData.length === 0) {
    noFiles.style.display = 'none';
    noExif.style.display = 'block';
    tableContainer.style.display = 'block';
    document.getElementById('exif-table').style.display = 'none';
  } else {
    noFiles.style.display = 'none';
    noExif.style.display = 'none';
    tableContainer.style.display = 'block';
    document.getElementById('exif-table').style.display = 'table';
    displayPaginatedData();
  }
}

export function filterExifData() {
  let tempFilteredData = exifData.filter(item => {
    if (selectedProps.size > 0 && !selectedProps.has(item.name)) return false;
    return true;
  });
  if (selectedProps.size > 0) {
    const obtained = new Set(tempFilteredData.map(i => i.name));
    selectedProps.forEach(prop => {
      if (!obtained.has(prop)) tempFilteredData.push({ name: prop, value: '-', description: '' });
    });
  }
  filteredExifData = tempFilteredData;
  currentPage = 1;
  displayPaginatedData();
}

export function displayPaginatedData() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredExifData.slice(startIndex, endIndex);
  const tableBody = document.getElementById('exif-table-body');
  tableBody.innerHTML = '';
  paginatedData.forEach(item => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const displayName = exifDescriptions[item.name] || item.name;
    nameCell.textContent = displayName;
    row.appendChild(nameCell);
    const valueCell = document.createElement('td');
    valueCell.textContent = item.value;
    row.appendChild(valueCell);
    tableBody.appendChild(row);
  });
  updatePagination();
}

export function updatePagination() {
  const totalPages = Math.ceil(filteredExifData.length / itemsPerPage);
  const pagination = document.getElementById('pagination');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');
  if (totalPages <= 1) pagination.style.display = 'none';
  else {
    pagination.style.display = 'flex';
    pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }
}

export function changePage(direction) {
  const totalPages = Math.ceil(filteredExifData.length / itemsPerPage);
  currentPage += direction;
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;
  displayPaginatedData();
}

export function sortTable(columnIndex) {
  const table = document.getElementById('exif-table');
  const tbody = table.getElementsByTagName('tbody')[0];
  const rows = Array.from(tbody.getElementsByTagName('tr'));
  const currentSort = table.getAttribute('data-sort') || 'asc';
  const newSort = currentSort === 'asc' ? 'desc' : 'asc';
  table.setAttribute('data-sort', newSort);
  rows.sort((a, b) => {
    const aText = a.cells[columnIndex].textContent;
    const bText = b.cells[columnIndex].textContent;
    if (!isNaN(aText) && !isNaN(bText)) {
      return newSort === 'asc' ? parseFloat(aText) - parseFloat(bText) : parseFloat(bText) - parseFloat(aText);
    } else {
      if (aText < bText) return newSort === 'asc' ? -1 : 1;
      if (aText > bText) return newSort === 'asc' ? 1 : -1;
      return 0;
    }
  });
  rows.forEach(row => tbody.appendChild(row));
}

export function getFiles() { return currentFiles; }

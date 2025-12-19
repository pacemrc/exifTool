import { exifDescriptions, commonExifProps } from '../core/constants.js';
import { showMessage } from '../components/ui.js';
import { getDirectoryName } from './view.js';

export function exportToCSV(files, selectedProps) {
  const list = files || [];
  if (list.length === 0) {
    showMessage('请上传图像文件查询后导出', 'error');
    return;
  }
  const props = selectedProps.size > 0 ? Array.from(selectedProps) : commonExifProps.slice();
  const escapeCsv = (str) => {
    if (str === undefined || str === null) str = '';
    if (typeof str !== 'string') str = String(str);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  };
  const header = ['文件名', ...props.map(p => exifDescriptions[p] || p)];
  let csvContent = header.map(escapeCsv).join(',') + '\n';
  list.forEach(f => {
    const row = [f.name];
    props.forEach(p => {
      const found = (f.exifData || []).find(i => i.name === p);
      const v = found ? found.value : '-';
      row.push(v);
    });
    csvContent += row.map(escapeCsv).join(',') + '\n';
  });
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  // 获取目录名称作为CSV文件名
  const directoryName = getDirectoryName() || 'exif-data';
  
  // 处理文件名冲突，添加本地时间戳确保唯一性
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  const fileName = `${directoryName}-${timestamp}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showMessage('CSV文件导出成功', 'success');
}

import { exifDescriptions, commonExifProps } from '../core/constants.js';
import { showMessage } from '../components/ui.js';

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
  const fileName = `exif-data-${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showMessage('CSV文件导出成功', 'success');
}

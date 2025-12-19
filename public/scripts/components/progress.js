export function startProgress(total) {
  const progressContainer = document.getElementById('upload-progress');
  const progressBar = document.querySelector('#upload-progress .progress-bar');
  const progressText = document.querySelector('#upload-progress .progress-text');
  const t = total || 1;
  let percent = 0;
  if (progressContainer) progressContainer.style.display = 'block';
  if (progressBar) progressBar.style.width = '0%';
  if (progressText) progressText.textContent = `0% - 处理中...`;
  const timer = setInterval(() => {
    percent = Math.min(percent + 2, 90);
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${percent}% - 处理中...`;
    if (percent >= 90) clearInterval(timer);
  }, 200);
  return timer;
}

export function finishProgress(processed, total, timer) {
  if (timer) clearInterval(timer);
  const progressContainer = document.getElementById('upload-progress');
  const progressBar = document.querySelector('#upload-progress .progress-bar');
  const progressText = document.querySelector('#upload-progress .progress-text');
  const t = total || 1;
  if (progressBar) progressBar.style.width = '100%';
  if (progressText) progressText.textContent = `100% - 已处理 ${processed}/${t}`;
  setTimeout(() => {
    if (progressContainer) progressContainer.style.display = 'none';
    if (progressBar) progressBar.style.width = '0%';
    if (progressText) progressText.textContent = '0% - 处理中...';
  }, 1500);
}

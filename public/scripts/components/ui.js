export function showMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `status-message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.position = 'fixed';
  messageDiv.style.top = '20px';
  messageDiv.style.right = '20px';
  messageDiv.style.zIndex = '10000';
  messageDiv.style.padding = '15px 25px';
  messageDiv.style.borderRadius = '8px';
  messageDiv.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
  messageDiv.style.fontWeight = '600';
  messageDiv.style.fontSize = '14px';
  messageDiv.style.transition = 'all 0.3s ease';
  messageDiv.style.animation = 'slideIn 0.3s ease-out';
  const style = document.createElement('style');
  style.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
  document.head.appendChild(style);
  document.body.appendChild(messageDiv);
  setTimeout(() => {
    messageDiv.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      messageDiv.remove();
      style.remove();
    }, 300);
  }, 5000);
}

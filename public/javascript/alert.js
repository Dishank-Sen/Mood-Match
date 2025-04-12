export function showAlert(message, type = 'success') {
    // Customize icon & colors based on type
    const typeConfig = {
      success: {
        border: 'border-green-600',
        bg: 'bg-green-600',
        text: 'text-green-200',
        icon: `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
          </svg>`
      },
      fail: {
        border: 'border-red-800',
        bg: 'bg-red-800',
        text: 'text-red-200',
        icon: `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 1a9 9 0 1 0 9 9A9 9 0 0 0 10 1Zm1 13H9v-2h2Zm0-4H9V5h2Z"/>
          </svg>`
      },
      error: {
        border: 'border-orange-700',
        bg: 'bg-orange-700',
        text: 'text-orange-200',
        icon: `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 1a9 9 0 1 0 9 9A9 9 0 0 0 10 1Zm1 13H9v-2h2Zm0-4H9V5h2Z"/>
          </svg>`
      }
    };
  
    const config = typeConfig[type] || typeConfig.success;
  
    const alert = document.createElement('div');
    alert.className = `fixed top-4 left-1/2 -translate-x-1/2 flex items-center w-full max-w-xs rounded-md p-4 mb-4 text-gray-300 border-t-4 ${config.border} bg-gray-950 z-50`;
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `
      <div class="inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg ${config.bg} ${config.text}">
        ${config.icon}
        <span class="sr-only">${type} icon</span>
      </div>
      <div class="ms-3 text-sm font-normal">${message}</div>
      <button type="button" class="ms-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-white rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-800 inline-flex items-center justify-center h-8 w-8" aria-label="Close">
        <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    `;
  
    // Append to body
    document.body.appendChild(alert);
  
    // Close button functionality
    alert.querySelector('button').addEventListener('click', () => {
      alert.remove();
    });
  
    // Auto-remove after 5 seconds
    setTimeout(() => alert.remove(), 3000);
  }
  
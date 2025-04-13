import { showAlert } from './alert.js';

document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem("userId");
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationDropdown = document.getElementById('notificationDropdown');

    function generateRoomID(userId1, userId2) {
        return [userId1, userId2].sort().join('-'); // ensures consistent order
      }

    function formatDate(isoString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(isoString).toLocaleDateString('en-US', options); // e.g., "Apr 8, 2025"
      }
      
      function formatTime(isoString) {
        return new Date(isoString).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }

      function fillNotificationDropdown(notifications){
        const notificationList = document.getElementById('notificationList');
        notificationList.classList.remove('hidden');
        notifications.forEach(notification => {
            const notificationE1 = document.createElement('li');
            notificationE1.classList.add('cursor-pointer', 'flex', 'items-start', 'gap-2', 'text-sm', 'text-slate-800', 'rounded-md', 'p-3', 'transition-all', 'hover:bg-slate-100');
            const dateStr = formatDate(notification.createdAt);
            const timeStr = formatTime(notification.createdAt);
            const roomID = generateRoomID(userId,notification.senderId);
            notificationE1.innerHTML = `<a href="/inbox?userId=${userId}"><div class="flex flex-col">
                <div class="flex items-center gap-2 justify-between w-full">
                  <p class="font-semibold text-slate-800 text-md">${notification.senderName}</p>
                  <span class="text-slate-500 text-sm whitespace-nowrap">sent you a message</span>
                </div>
                <p class="text-xs text-slate-500 mt-1">${dateStr} ${timeStr}</p>
              </div>
              </a>`
            notificationList.appendChild(notificationE1);
        });
    }

    function updateNotification(count,notifications){
        fillNotificationDropdown(notifications);
        const notificationCount = document.getElementById('notificationCount');
        const notificationNumber = document.getElementById('notificationNumber');
        notificationCount.classList.remove('hidden');
        notificationNumber.innerText = count;
    }

    function openChatRoom(){

    }

    try {
        const response = await fetch('https://mood-match-production-b16d.up.railway.app/api/notificationStatus', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
            credentials:'include'
          });

          if(response.ok){
            const data = await response.json();
            const notifications = data.notifications;

            if(notifications){
                const count = notifications.length;
                if(count>0){
                    updateNotification(count,notifications);
                }
            }
          }
    } catch (error) {
        console.log(error);
    }

    // Toggle dropdown visibility
    notificationIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click handler from firing
        notificationDropdown.classList.toggle('hidden');
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', () => {
        notificationDropdown.classList.add('hidden');
    });

    // Stop dropdown from hiding when clicking inside it
    notificationDropdown.addEventListener('click', (event) => {
        event.stopPropagation();
    });

})
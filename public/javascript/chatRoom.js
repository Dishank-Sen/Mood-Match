document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const urlParams = new URLSearchParams(window.location.search);
    const messageInput = document.getElementById('messageInput');
    const send = document.getElementById('send');
    const chatBox = document.getElementById('chatBox');
    const userId = localStorage.getItem('userId');


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
    const currentTimestamp = new Date().toISOString();
    const currentDatestr = formatDate(currentTimestamp)

    function generateRoomID(userId1, userId2) {
        return [userId1, userId2].sort().join('-'); // ensures consistent order
      }
    
      const [paramUser1, paramUser2] = urlParams.get('roomID').split('-');
      const roomID = generateRoomID(paramUser1, paramUser2);
      const messageReceiverID = (paramUser1 === userId) ? paramUser2 : paramUser1;
      const receiverId = messageReceiverID;
      const senderId = userId;
      const messageSenderId = senderId;
      
      
    socket.emit("join-room", {roomID,senderId,receiverId});

    send.addEventListener('click', () => {
        const message = messageInput.value.trim();
        const currentTimestamp = new Date().toISOString();
        if (message !== '') {
          socket.emit('send-message', {
            roomID,
            messageSenderId,
            messageReceiverID,
            message,
            currentTimestamp
          });

          messageInput.value = '';

        }
      });

    socket.on('load-messages', (messages) => {
        messages.forEach(message => {
            console.log(message)
            const dateStr = formatDate(message.timestamp);
            const timeStr = formatTime(message.timestamp);

            let currentDateSection = document.getElementById(`date-${dateStr}`);
            if (!currentDateSection) {
                const dateHeader = document.createElement('div');
                dateHeader.classList.add('flex','items-center','justify-center');
                dateHeader.innerHTML = `<span class="text-center text-gray-200 bg-gray-700 rounded-lg w-fit px-2 py-1">${dateStr}</span>`;
                dateHeader.id = `date-${dateStr}`;
                chatBox.appendChild(dateHeader);
            }

            if(message.senderId == userId){
                const newMessage = `<div class="flex justify-end my-2 pr-4">
                  <div class="bg-indigo-600 text-white p-3 rounded-xl max-w-xs flex justify-between gap-4">
                      <p class="text-sm">${message.message}</p>
                      <div class="justify-start items-end inline-flex min-w-12">
                          <h3 class="text-gray-300 text-xs font-normal leading-4 ">${timeStr}</h3>
                      </div>
                  </div>
                  </div>`
                chatBox.insertAdjacentHTML('beforeend',newMessage);
            }else{
                const newMessage = `<div class="grid justify-start pl-4">
                <div class="flex gap-2.5 mb-4">
                  <img src="${message.senderProfile}" class="w-8 h-8 rounded-full object-cover" />
                  <div class="grid">
                    <h5 class="text-white text-sm font-semibold leading-snug pb-1">${message.senderName}</h5>
                    <div class="bg-gray-700 text-white p-3 rounded-xl max-w-xs flex justify-between gap-4">
                          <p class="text-sm">${message.message}</p>
                          <div class="justify-end items-end inline-flex min-w-12">
                              <h6 class="text-gray-300 text-xs font-normal leading-4">${timeStr}</h6>
                          </div>
                      </div>
                  </div>
                </div>
                </div>`
                chatBox.insertAdjacentHTML('beforeend',newMessage);
            }
        });
    });

    socket.on('receive-message', (messages) => {
        console.log("receive-message:", messages)
        const timeStr = formatTime(messages.timestamp);
        const dateStr = formatTime(messages.timestamp);

        let currentDateSection = document.getElementById(`date-${dateStr}`);
          if (!currentDateSection) {
              const dateHeader = document.createElement('div');
              dateHeader.classList.add('flex','items-center','justify-center');
              dateHeader.innerHTML = `<span class="text-center text-gray-200 bg-gray-700 rounded-lg w-fit px-2 py-1">${dateStr}</span>`;
              dateHeader.id = `date-${dateStr}`;
              chatBox.appendChild(dateStr);
          }

        if(messages.receiverId == userId){
            const newMessage = `<div class="grid justify-start pl-4">
            <div class="flex gap-2.5 mb-4">
              <img src="${messages.senderProfile}" class="w-8 h-8 rounded-full object-cover">
              <div class="grid">
                <h5 class="text-white text-sm font-semibold leading-snug pb-1">${messages.senderName}</h5>
                <div class="bg-gray-700 text-white p-3 rounded-xl max-w-xs flex justify-between gap-4">
                      <p class="text-sm">${messages.message}</p>
                      <div class="justify-end items-end inline-flex min-w-12">
                          <h6 class="text-gray-300 text-xs font-normal leading-4">${timeStr}</h6>
                      </div>
                  </div>
              </div>
            </div>
            </div>`
            chatBox.insertAdjacentHTML('beforeend',newMessage);
          }else{
            const newMessage = `<div class="flex justify-end my-2 pr-4">
              <div class="bg-indigo-600 text-white p-3 rounded-xl max-w-xs flex justify-between gap-4">
                  <p class="text-sm">${messages.message}</p>
                  <div class="justify-start items-end inline-flex min-w-12">
                      <h3 class="text-gray-300 text-xs font-normal leading-4 ">${timeStr}</h3>
                  </div>
              </div>
              </div>`
              chatBox.insertAdjacentHTML('beforeend',newMessage);
        }
    })
    
});
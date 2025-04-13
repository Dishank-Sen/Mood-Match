import { showAlert } from './alert.js';

document.addEventListener('DOMContentLoaded', async () => {
    const socket = io();
    const userId = localStorage.getItem('userId');
    const usersList = document.getElementById('usersList');
    const defaultWindow = document.getElementById('defaultWindow');
    const chatBox = document.getElementById('chatBox');
    const chatBody = document.getElementById('chatBody');
    const backBtn = document.getElementById('backBtn');
    const chatList = document.getElementById('chatList');
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');
    
    // generates roomID
    function generateRoomID(userId1, userId2) {
        return [userId1, userId2].sort().join('-'); 
      }
    
    // make date and time in correct format
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

      // fetch users data
      async function getUsers(userId){
        try {
            const response = await fetch('https://mood-match-production-3bbf.up.railway.app/api/inbox', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
                credentials:'include'
              });
    
              if (response.status == 201) {
                const data = await response.json();
                const messages = data.message;
                return messages;
              }else if(response.status == 400){
                const errorData = await response.json();
                showAlert(errorData.message,'fail');
                return null; 
              }else if(response.status == 500){
                const errorData = await response.json();
                showAlert(errorData.message,'error'); 
                return null;
              }else{
                showAlert("Unexpected error",'error'); 
                return nnull;
              }
        } catch (error) {
            showAlert('An error occurred: ' + error.message,'error');
            return null;
        }
      }

      
      // load chats
      function openChat(chatId) {
        chatBody.scrollTop = chatBody.scrollHeight;
        const senderId = chatId;
        const receiverId = userId;
        const messageSenderId = userId;
        const messageReceiverID = chatId;
        const roomID = generateRoomID(senderId,userId);
       
        const currentTimestamp = new Date().toISOString();
        const currentDatestr = formatDate(currentTimestamp);
        
        // chats using socket
        socket.emit("join-room", {roomID,senderId,receiverId});
            
        sendBtn.addEventListener('click', () => {
          const message = messageInput.value.trim();
            if (message !== '') {
              socket.emit('send-message', {
                roomID,
                messageReceiverID, 
                messageSenderId,
                message,
                currentTimestamp
              });
              messageInput.value = '';
            }
        });

        socket.on('load-messages', (messages) => {
          chatBody.scrollTop = chatBody.scrollHeight;
          let profileImg = null;
          let senderName = null;
          for (const message of messages) {
            if (message.receiverId === userId) {
                profileImg = message.senderProfile;
                senderName = message.senderName;
                console.log(senderName);
                break;
            }
          }

          
          // making header section
          document.getElementById('chatHeaderImg').src = profileImg;
          document.getElementById('chatHeaderName').innerText = senderName;
          
          messages.forEach(message => {

              const dateStr = formatDate(message.timestamp);
              const timeStr = formatTime(message.timestamp);

              // Check if date header already exists
              let dateSection = document.getElementById(`date-${dateStr}`);
              if (!dateSection) {
                  const dateHeader = document.createElement('div');
                  dateHeader.classList.add('flex','items-center','justify-center');
                  dateHeader.innerHTML = `<span class="text-center text-gray-200 bg-gray-700 rounded-lg w-fit px-2 py-1">${dateStr}</span>`;
                  dateHeader.id = `date-${dateStr}`;
                  chatBody.appendChild(dateHeader);
              }
              console.log(message.senderId,"  ",userId,"  ",message.message)
              if(message.senderId == userId){
                  const newMsg = `<div class="flex justify-end">
                  <div class="bg-indigo-600 text-white p-3 rounded-xl max-w-xs flex justify-between gap-4">
                      <p class="text-sm">${message.message}</p>
                      <div class="justify-start items-end inline-flex min-w-12">
                          <h3 class="text-gray-300 text-xs font-normal leading-4 ">${timeStr}</h3>
                      </div>
                  </div>
                  </div>`
                  chatBody.insertAdjacentHTML('beforeend',newMsg);
              }else{
                  const newMsg = `<div class="flex items-start space-x-3">
                  <img src="${profileImg}" class="w-8 h-8 rounded-full object-cover" />
                  <div class="bg-gray-700 text-white p-3 rounded-xl max-w-xs flex justify-between gap-4">
                      <p class="text-sm">${message.message}</p>
                      <div class="justify-end items-end inline-flex min-w-12">
                          <h6 class="text-gray-300 text-xs font-normal leading-4">${timeStr}</h6>
                      </div>
                  </div>
                  </div>`
                  chatBody.insertAdjacentHTML('beforeend',newMsg);
              }
          });
        });

        socket.on('receive-message', (messages) => {
          chatBody.scrollTop = chatBody.scrollHeight;
          console.log("receive-message:", messages.message)

          const dateStr = formatDate(messages.timestamp);
          const timeStr = formatTime(messages.timestamp);

          // Check if date header already exists
          let dateSection = document.getElementById(`date-${dateStr}`);
          if (!dateSection) {
              const dateHeader = document.createElement('div');
              dateHeader.classList.add('flex','items-center','justify-center');
              dateHeader.innerHTML = `<span class="text-center text-gray-200 bg-gray-700 rounded-lg w-fit px-2 py-1">${dateStr}</span>`;
              dateHeader.id = `date-${dateStr}`;
              chatBody.appendChild(dateHeader);
          }
          console.log(messages.receiverId,"  ",userId);
          if(messages.receiverId == userId){
            const newMsg = `<div class="flex items-start space-x-3">
                <img src="${messages.senderProfile}" class="w-8 h-8 rounded-full object-cover" />
                <div class="bg-gray-700 text-white p-3 rounded-xl max-w-xs flex justify-between gap-4">
                    <p class="text-sm">${messages.message}</p>
                    <div class="justify-end items-end inline-flex min-w-12">
                        <h6 class="text-gray-300 text-xs font-normal leading-4">${timeStr}</h6>
                    </div>
                </div>
                </div>`
            chatBody.insertAdjacentHTML('beforeend',newMsg);
          }else{
            const newMsg = `<div class="flex justify-end">
              <div class="bg-indigo-600 text-white p-3 rounded-xl max-w-xs flex justify-between gap-4">
                  <p class="text-sm">${messages.message}</p>
                  <div class="justify-start items-end inline-flex min-w-12">
                      <h3 class="text-gray-300 text-xs font-normal leading-4 ">${timeStr}</h3>
                  </div>
              </div>
              </div>`
            chatBody.insertAdjacentHTML('beforeend',newMsg);
          }
        });

        defaultWindow.style.display = 'none';
        chatBox.style.display = 'flex';
        chatList.classList.add('hidden');
      }
      
      backBtn.addEventListener('click', () => {
        chatBox.style.display = 'none';
        chatList.classList.remove('hidden');
      });


    // load users
    function loadChats(users){
        if(users){
            if(users.length > 0){
                users.forEach(user => {
                    const userList = document.createElement('li');
                    userList.classList.add('p-4', 'hover:bg-gray-700', 'border-b', 'border-gray-700', 'cursor-pointer');

                    const count = user.messages.length;
                    const msg = user.messages[count-1];
                    const dateStr = formatDate(user.messages[count-1].timestamp);
                    const timeStr = formatTime(user.messages[count-1].timestamp);
                    
                    let profileImg = null;
                    let name = null;
                    for (const message of user.messages) {
                        if (message.receiverId === userId) {
                            userList.id = message.senderId;
                            name = message.senderName;
                            profileImg = message.senderProfile;
                            break;
                        }
                      }
                      
        
                    userList.innerHTML = `<div class="flex items-center justify-between">
                        <div class="flex flex-row gap-4">
                            <img src="${profileImg}" alt="Profile" class="w-10 h-10 rounded-full" />
                            <div class="flex flex-col justify-start">
                                <h3 class="font-semibold text-white">${name}</h3>
                                <span class="block truncate text-gray-400 text-sm max-w-[220px]">
                                    ${msg.message}
                                </span>
                            </div>
                        </div>
                        <div class="flex justify-end flex-col">
                            <span class="text-gray-400 text-sm">${dateStr}</span>
                            <span class="text-gray-400 text-sm">${timeStr}</span>
                        </div>                  
                    </div>`
                    usersList.insertBefore(userList, usersList.firstChild);

                    document.getElementById(`${userList.id}`).addEventListener('click', () => {
                        userList.disabled = true;
                        openChat(userList.id);
                    })

                  
                })
            }
        }

    }


    const users = await getUsers(userId);
    loadChats(users);
});
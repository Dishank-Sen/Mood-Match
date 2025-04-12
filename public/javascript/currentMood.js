document.addEventListener('DOMContentLoaded' , () => {
    const socket = io();

    const userId = localStorage.getItem("userId"); 
    const urlParams = new URLSearchParams(window.location.search);
    const mood = urlParams.get('mood');
    document.title = `Mood Match | ${mood}`

    socket.emit("user-online", { userId, mood });

    socket.on(`user-list-${mood}`, (users) => {
        // Filter out the current user
        const otherUsers = users.filter(user => user.userId !== userId);

        // Render to DOM (you can customize this part)
        const userList = document.getElementById("userList");
        userList.innerHTML = ""; // clear previous list

        otherUsers.forEach(user => {
            const userEl = document.createElement("li");
            userEl.classList.add('py-3', 'sm:py-4')
            userEl.innerHTML = `<div class="flex items-center space-x-4 rtl:space-x-reverse">
                <div class="shrink-0">
                    <img class="aspect-square w-10 rounded-full cursor-pointer" src="${user.profileImg}" alt="profile">
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                        ${user.displayName}
                    </p>
                </div>
                <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    <button type="button" id="chat-${user.userId}" class="text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer">Chat</button>   
                </div>
            </div>`;
            userList.appendChild(userEl);
            const chat = document.getElementById(`chat-${user.userId}`);
            chat.addEventListener('click', () => {
                const userIdA = localStorage.getItem("userId");
                const userIdB = user.userId;
                const roomID = `${userIdA}-${userIdB}`;
                window.open(`/chat?roomID=${roomID}`);
            });
        });
    });
});




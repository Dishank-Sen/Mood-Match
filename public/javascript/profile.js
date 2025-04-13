import { showAlert } from './alert.js';

document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');
    async function getData(userId){
        try { 
            const response = await fetch('https://mood-match-production-b16d.up.railway.app/api/profile', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
                credentials: 'include'
              });
    
              if(response.status == 201){
                const data = await response.json();
                return {
                    displayName: data.displayName,
                    userName: data.userName,
                    contact: data.contact,
                    email: data.email,
                    profileImg: data.profileImg
                  };              
              }
        } catch (error) {
            showAlert(error,'error');
        }
    }

    function updateCard(displayName, userName, contact, email, profileImg){
        const cardProfileImg = document.getElementById('cardProfileImg');
        const cardDisplayName = document.getElementById('cardDisplayName');
        const cardPhone = document.getElementById('cardPhone');
        const cardEmail = document.getElementById('cardEmail');
        const cardUserName = document.getElementById('cardUserName');
        
        cardProfileImg.src = profileImg;
        cardUserName.innerText = userName;
        cardDisplayName.innerText = displayName;
        cardPhone.innerText = contact;
        cardEmail.innerText = email;
    }

    const { displayName, userName, contact, email, profileImg } = await getData(userId);
    updateCard(displayName, userName, contact, email, profileImg);
});
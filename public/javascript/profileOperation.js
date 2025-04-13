import { showAlert } from './alert.js';

document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');
    const signout = document.getElementById('signout');
    const myProfile = document.getElementById('myProfile');
    const editProfile = document.getElementById('editProfile');
    const inbox = document.getElementById('inbox');
    
    signout.addEventListener('click', async () => {
        signout.disabled = true;
        try{
            const response = await fetch('https://mood-match-production-b16d.up.railway.app/api/signout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({userId}),
            credentials:'include'
            });
    
            if (response.status == 201) {
                const data = await response.json();
                localStorage.removeItem('userId'); 
                localStorage.removeItem('profileImg'); 
                showAlert(data.message,'success');
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.replace('https://mood-match-production-b16d.up.railway.app/');
            } else if(response.status == 500) {
                showAlert(response.message,'error');
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.replace('https://mood-match-production-b16d.up.railway.app/');
            }
        }catch(err){
            showAlert(err,'error');
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.replace('https://mood-match-production-b16d.up.railway.app/');
        }    
    });

    myProfile.addEventListener('click', () => {
        myProfile.disabled = true;
        window.location.href = `https://mood-match-production-b16d.up.railway.app/profile?userId=${userId}`;
    });

    editProfile.addEventListener('click', () => {
        editProfile.disabled = true;
        window.location.href = `https://mood-match-production-b16d.up.railway.app/editProfile?userId=${userId}`;
    });

    inbox.addEventListener('click', () => {
        editProfile.disabled = true;
        window.location.href = `https://mood-match-production-b16d.up.railway.app/inbox?userId=${userId}`;
    });
});
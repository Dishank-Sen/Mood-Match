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
            const response = await fetch('/api/signout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({userId})
            });
    
            if (response.status == 201) {
                const data = await response.json();
                localStorage.removeItem('userId'); 
                localStorage.removeItem('profileImg'); 
                showAlert(data.message,'success');
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.replace('/');
            } else if(response.status == 500) {
                showAlert(response.message,'error');
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.replace('/');
            }
        }catch(err){
            showAlert(err,'error');
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.replace('/');
        }    
    });

    myProfile.addEventListener('click', () => {
        myProfile.disabled = true;
        window.location.href = `/profile?userId=${userId}`;
    });

    editProfile.addEventListener('click', () => {
        editProfile.disabled = true;
        window.location.href = `/editProfile?userId=${userId}`;
    });

    inbox.addEventListener('click', () => {
        editProfile.disabled = true;
        window.location.href = `/inbox?userId=${userId}`;
    });
});
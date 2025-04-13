import { showAlert } from './alert.js';

document.addEventListener('DOMContentLoaded', async () => {
    const profileEdit = document.getElementById('profileEdit');
    const displayNameEdit = document.getElementById('displayNameEdit');
    const nameEdit = document.getElementById('nameEdit');
    const phoneEdit = document.getElementById('phoneEdit');
    const emailEdit = document.getElementById('emailEdit');
    const displayNameInput = document.getElementById('displayNameInput');
    const userNameInput = document.getElementById('userNameInput');
    const phoneInput = document.getElementById('phoneInput');
    const emailInput = document.getElementById('emailInput');
    const profileInput = document.getElementById('profileInput');
    const userNametd = document.getElementById('userNametd');
    const phonetd = document.getElementById('phonetd');
    const emailtd = document.getElementById('emailtd');
    const cardProfileImg = document.getElementById('cardProfileImg');
    const cardDisplayName = document.getElementById('cardDisplayName');
    const cardPhone = document.getElementById('cardPhone');
    const cardEmail = document.getElementById('cardEmail');
    const cardUserName = document.getElementById('cardUserName');
    const saveBtn = document.getElementById('saveBtn');
    const userId = localStorage.getItem('userId');

        
    displayNameEdit.addEventListener('click', () => {
        cardDisplayName.classList.add('hidden');
        displayNameInput.classList.remove('hidden');
        displayNameInput.value = cardDisplayName.innerText;
    });
    nameEdit.addEventListener('click', () => {
        cardUserName.classList.add('hidden');
        userNametd.classList.remove('hidden');
        userNameInput.value = cardUserName.innerText;
    });
    phoneEdit.addEventListener('click', () => {
        cardPhone.classList.add('hidden');
        phonetd.classList.remove('hidden');
        phoneInput.value = cardPhone.innerText;
    });
    emailEdit.addEventListener('click', () => {
        cardEmail.classList.add('hidden');
        emailtd.classList.remove('hidden');
        emailInput.value = cardEmail.innerText;
    });

    profileEdit.addEventListener('click', () => {
        profileInput.click(); // triggers the file dialog
    });
    
    // preview selected image
    profileInput.addEventListener('change', () => {
        const file = profileInput.files[0];
        if (file) {
            cardProfileImg.src = URL.createObjectURL(file); // show preview
        }
    });

    saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        document.getElementById('saveBtnText').style.display = 'none';
        document.getElementById('loading').style.display = 'block';
        const displayName = displayNameInput.value || cardDisplayName.innerText;
        const userName = userNameInput.value || cardUserName.innerText;
        const phone = phoneInput.value || cardPhone.innerText;
        const email = emailInput.value || cardEmail.innerText;
        const formData = new FormData();


        formData.append("userId", userId)
        formData.append("displayName", displayName);
        formData.append("userName", userName);
        formData.append("phone", phone);
        formData.append("email", email);
        if(profileInput.files[0]){
            formData.append("file", profileInput.files[0]);
        }

        try {
            const response = await fetch('https://mood-match-production-b16d.up.railway.app/api/editProfile', {
                method: 'POST',
                body: formData,
                credentials:'include'
            });
    
            if (response.status == 201) {
                const data = await response.json();
                showAlert(data.message,'success');
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.replace('https://mood-match-production-b16d.up.railway.app/login');
              } else if(response.status == 404) {
                const errorData = await response.json();
                showAlert(errorData.message,'fail'); 
                await new Promise(resolve => setTimeout(resolve, 2000));
                window.location.reload();
              }else if(response.status == 413){
                const errorData = await response.json();
                showAlert(errorData.message,'fail'); 
                await new Promise(resolve => setTimeout(resolve, 2000));
                window.location.reload();
              }else if(response.status == 500){
                const errorData = await response.json();
                showAlert(errorData.message,'error'); 
                await new Promise(resolve => setTimeout(resolve, 2000));
                window.location.reload();
              }else{
                showAlert('unexpected error','error'); 
                await new Promise(resolve => setTimeout(resolve, 2000));
                window.location.reload();
              }
        } catch (error) {
            showAlert('An error occurred: ' + error.message,'error');
            await new Promise(resolve => setTimeout(resolve, 2000));
            window.location.reload(); 
        }
    });
});
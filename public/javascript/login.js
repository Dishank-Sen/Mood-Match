import { showAlert } from './alert.js';
document.addEventListener('DOMContentLoaded', async () => {
  showAlert('test','success');
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent the default form submission
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const loading = document.getElementById('loading');
      const btnText = document.getElementById('btnText');
      const submitBtn = document.getElementById('submitBtn');
  
      try{
        submitBtn.disabled = true;
        submitBtn.classList.add('cursor-not-allowed');
        btnText.style.display = 'none';
        loading.style.display = 'block';
        const response = await fetch('https://mood-match-production-3bbf.up.railway.app/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          credentials:'include'
        });
        console.log(response);
        if (response.status == 201) {
          const data = await response.json();
          showAlert(data.message,'success');
          const userId = data.userId;
          localStorage.setItem('userId', userId);
          localStorage.setItem('profileImg', data.profileImgUrl);
          await new Promise(resolve => setTimeout(resolve, 1000));
          window.location.replace('https://mood-match-production-3bbf.up.railway.app/');
        }else if(response.status == 401){
          const errorData = await response.json();
          showAlert(errorData.message,'fail'); 
          await new Promise(resolve => setTimeout(resolve, 2000));
          // window.location.reload();
        }else if(response.status == 500){
          const errorData = await response.json();
          showAlert(errorData.message,'error'); 
          await new Promise(resolve => setTimeout(resolve, 2000));
          // window.location.reload();
        }else if(response.status == 429){
          const errorData = await response.json();
          showAlert(errorData.message,'error'); 
          await new Promise(resolve => setTimeout(resolve, 2000));
          // window.location.reload();
        }else{
          showAlert("Unexpected error",'error'); 
          await new Promise(resolve => setTimeout(resolve, 2000));
          // window.location.reload();
        }
      }catch(error){
        showAlert('An error occurred: ' + error.message,'error');
        await new Promise(resolve => setTimeout(resolve, 2000));
        // window.location.reload(); 
      }
    });
})
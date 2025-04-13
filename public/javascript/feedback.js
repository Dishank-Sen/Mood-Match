import { showAlert } from './alert.js';

document.addEventListener('DOMContentLoaded', async () =>{
    document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
      e.preventDefault(); 
      const email = document.getElementById('email').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;

        try {
          const response = await fetch('https://mood-match-production-3bbf.up.railway.app/api/feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, subject, message }),
            credentials:'include'
          });
      
  
          if (response.status == 201) {
            const data = await response.json();
            showAlert(data.message,'success');
            window.location.reload();
          } else if(response.status == 500){
            const data = await response.json();
            showAlert(data.message,'error');
            window.location.reload();
          }else{
            showAlert('Unexpected error','error');
            window.location.reload();
          }
        } catch (error) {
          showAlert('An error occurred: ' + error.message,'error'); 
          window.location.reload();
        }
    });
  
  });
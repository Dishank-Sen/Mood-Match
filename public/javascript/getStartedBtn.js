import { showAlert } from './alert.js';
document.addEventListener('DOMContentLoaded', () => {
  const getStartedBtn = document.getElementById('getStartedBtn');
  const userId = localStorage.getItem('userId');
  getStartedBtn.addEventListener('click', async () => {
    try{
        window.location.href = `/moodSelector?userId=${userId}`;
        getStartedBtn.disabled = true;
  
        const response = await fetch('/moodSelector', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials : 'include'
        });
      }catch(error){
        showAlert('An error occurred: ' + error.message,'error'); 
      }
  });
})
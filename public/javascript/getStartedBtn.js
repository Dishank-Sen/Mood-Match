import { showAlert } from './alert.js';
document.addEventListener('DOMContentLoaded', () => {
  const getStartedBtn = document.getElementById('getStartedBtn');
  const userId = localStorage.getItem('userId');
  getStartedBtn.addEventListener('click', async () => {
    try{
        window.location.href = `https://mood-match-production-3bbf.up.railway.app/moodSelector?userId=${userId}`;
        getStartedBtn.disabled = true;
  
        const response = await fetch('https://mood-match-production-3bbf.up.railway.app/moodSelector', {
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
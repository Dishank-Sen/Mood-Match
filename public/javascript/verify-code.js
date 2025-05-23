import { showAlert } from './alert.js';

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById("verifyForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const code = document.getElementById("code").value;
        const btnText = document.getElementById('btnText');
        const verifyBtn = document.getElementById('verify');
        try {
            verifyBtn.disabled = true;
            verifyBtn.classList.add('cursor-not-allowed');
            btnText.style.display = 'none';
            loading.style.display = 'block';
            const res = await fetch("https://mood-match-production-b16d.up.railway.app/api/verify-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, code }),
              credentials:'include'
            });

            if(res.status == 201){
                const data = await res.json();
                showAlert(data.message,'success');
                await new Promise(resolve => setTimeout(resolve, 1000));
                  window.location.replace('https://mood-match-production-b16d.up.railway.app/reset-password');
            }else if(res.status == 401){
                const data = await res.json();
                showAlert(data.message, 'fail');
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.reload();
              }else if(res.status == 500){
                const data = await res.json();
                showAlert(data.message, 'error');
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.reload();
              }else{
                showAlert('Unexpected Error','error');
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.reload();
              }
        } catch (error) {
                showAlert(`Error:${error}`,'error');
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.reload();
        }
      
      });
})
import { showAlert } from './alert.js';

document.addEventListener('DOMContentLoaded', async () =>{
    setTimeout(() => {
      window.location.reload();
    }, 10 * 60 * 1000);
  
    const showPassword = document.getElementById('showPassword');

    showPassword.addEventListener('change', function () {
      const type = this.checked ? 'text' : 'password';
      document.getElementById('password').type = type;
      document.getElementById('confirm-password').type = type;
    });

    document.getElementById('signupForm').addEventListener('submit', async (e) => {
      e.preventDefault(); 
      const displayName = document.getElementById('displayName').value;
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const contact = document.getElementById('contact').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const terms = document.getElementById('terms');
      const loading = document.getElementById('loading');
      const btnText = document.getElementById('btnText');
      const submitBtn = document.getElementById('submitBtn');
      const profileImg = document.getElementById('profileImg');
      const otp = document.getElementById('otp');
      const verify = document.getElementById('verify');
      const verifyBtnText = document.getElementById('verifyBtnText');
      const verifyLoading = document.getElementById('verifyLoading');
      const timer = document.getElementById('timer');
      const resendOTP = document.getElementById('resendOTP');


      function startTimer(timer){
        let timeLeft = 60;
        timer.innerText = timeLeft;
        const timerInterval = setInterval(() => {
          timeLeft--;
          timer.innerText = timeLeft;
      
          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            resendOTP.disabled = false;
            resendOTP.classList.remove('cursor-not-allowed');
            resendOTP.textContent = 'Resend OTP';
            timer.textContent = '';
          }
        }, 1000);
      }

      const formData = new FormData();
      formData.append("displayName", displayName);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("contact", contact);
      formData.append("password", password);
      formData.append("file", profileImg.files[0]);
        
      if (password !== confirmPassword) {
        showAlert('Passwords do not match','fail');
      }
      if (!terms.checked) {
        showAlert('You must agree to the terms and conditions.','fail');
      }
      if(password == confirmPassword && terms.checked) {
        try {
          submitBtn.disabled = true;
          submitBtn.classList.add('cursor-not-allowed');
          btnText.style.display = 'none';
          loading.style.display = 'block';
          const response = await fetch('/api/signup', {
            method: 'POST',
            body: formData,
          });
      
  
          if (response.status == 201) {
            const data = await response.json();
            showAlert(data.message,'success');
            const email = data.email;
            localStorage.setItem('email',email);
            otp.style.display = 'block';
            otp.disabled = false;
            resendOTP.classList.remove('hidden');
            document.getElementById('otpBox').classList.remove('hidden');
            startTimer(timer);
            verify.addEventListener('click', async () => {
              verify.disabled = true;
              verify.classList.add('cursor-not-allowed');
              verifyBtnText.style.display = 'none';
              verifyLoading.style.display = 'block';
              try {
                const res = await fetch('/api/verify-otp', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email:email, otp:otp.value })
                });

                if(res.status == 201){
                  localStorage.removeItem('email');
                  const data = await res.json();
                  showAlert(data.message,'success');
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  window.location.href = "/login";
                }else if(res.status == 401){
                  const errorData = await response.json();
                  showAlert(errorData.message,'fail'); 
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  window.location.reload();
                }else if(res.status == 500){
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
                  showAlert(error,'error');
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  window.location.reload();
              }
            })
          } else if(response.status == 401) {
            const errorData = await response.json();
            showAlert(errorData.message,'fail'); 
            await new Promise(resolve => setTimeout(resolve, 2000));
            window.location.reload();
          }else if(response.status == 400) {
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
      }

      resendOTP.addEventListener('click', async () => {

        try {
          const res = await fetch('/api/resend-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({email:email})
          });

          if(res.status == 201){
            localStorage.removeItem('email');
            const data = await res.json();
            showAlert(data.message,'success');
          }else if(res.status == 500){
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
            showAlert(error,'error');
            await new Promise(resolve => setTimeout(resolve, 2000));
            window.location.reload();
        }
      })
    });
  
  });
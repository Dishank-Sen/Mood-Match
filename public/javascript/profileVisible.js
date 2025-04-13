document.addEventListener('DOMContentLoaded', async (e) => {
    const profile = document.getElementById('profile');
    const login_signup = document.getElementById('login-signup');
    try{
        const userId = localStorage.getItem('userId');
        if(!userId){
           
        }else{
            const response = await fetch('https://mood-match-production-b16d.up.railway.app/api/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({userId}),
            credentials : 'include'
            });
    
            if (response.status == 201) {
                const data = await response.json();
                const profileImgUrl = data.profileImg;
                document.getElementById('profileImg').src = profileImgUrl;
                login_signup.classList.add('hidden');
                profile.classList.remove('hidden');
            } else if(response.status == 401){
                const data = await response.json();
                console.log(data.message);
            }else if(response.status == 500){
                const data = await response.json();
                console.log(data.message);
            }else{
                const data = await response.json();
                console.log(data.message);
            }
        }
    }catch(err){
        console.log(err)
    }    
});
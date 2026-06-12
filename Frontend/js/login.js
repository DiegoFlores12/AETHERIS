const tabLogin=document.getElementById('tabLogin'), tabRegister=document.getElementById('tabRegister');
const loginForm=document.getElementById('loginForm'), registerForm=document.getElementById('registerForm'), msg=document.getElementById('msg');
tabLogin.onclick=()=> {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
};
tabRegister.onclick=()=> {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
};
loginForm.onsubmit=async(e)=> {
    e.preventDefault();
    msg.textContent='';
    try {
        const data=await api('/auth/login', {
            method:'POST', body:JSON.stringify({
                email:loginEmail.value, password:loginPassword.value
            })
        });
        setSession(data);
        location.href=data.user.role==='admin'?'admin.html':'cuenta.html';
    }
    catch (err) {
        msg.className='error';
        msg.textContent=err.message;
    }
};
registerForm.onsubmit=async(e)=> {
    e.preventDefault();
    try {
        const data=await api('/auth/register', {
            method:'POST', body:JSON.stringify({
                name:regName.value, rut:regRut.value, email:regEmail.value, password:regPassword.value, wantsQuestionnaire:wantsQuestionnaire.checked
            })
        });
        setSession(data);
        location.href=wantsQuestionnaire.checked?'cuestionario.html':'cuenta.html';
    }
    catch (err) {
        msg.className='error';
        msg.textContent=err.message;
    }
};

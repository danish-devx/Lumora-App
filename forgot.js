const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcGV5ZHR0dmZzeGptd2Jyc25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MjE3NTAsImV4cCI6MjA5NzQ5Nzc1MH0.N9ymG6L8mb7Jmke7PY_zyvitDgzGik4S3scGC50rNYY";
const supabaseUrl = "https://gmpeydttvfsxjmwbrsna.supabase.co";
const client = supabase.createClient(supabaseUrl, supabaseKey);



const checkActiveSession = async () => {
    const { data: { session } } = await client.auth.getSession();
    
    if (session) {
        window.location.href = 'dashboard.html'; 
    }

};

checkActiveSession();



async function handleForgotPassword(e) {
    if (e) e.preventDefault();

    const recoveryEmail = document.getElementById("recoveryEmail");
    if (!recoveryEmail) return;
    
    const email = recoveryEmail.value.trim();

    Swal.showLoading(); 

  
    const { data, error } = await client.auth.resetPasswordForEmail(email, {
       
        redirectTo: 'https://lumora-app-green.vercel.app/updatepassword.html',
        
    });

    if (error) {
        Swal.fire({
            icon: 'error',
            title: 'Reset Failed',
            text: error.message
        });
        return;
    }

    Swal.fire({
        icon: 'success',
        title: 'Reset Link Sent!',
        text: 'A secure password recovery link has been orchestrated to your email vault.',
        confirmButtonColor: '#a01820'
    });
    
    const forgotForm = document.getElementById("forgotPasswordForm");
    if (forgotForm) forgotForm.reset();
}


const forgotForm = document.getElementById("forgotPasswordForm");
if (forgotForm) {
    forgotForm.addEventListener("submit", handleForgotPassword);
}

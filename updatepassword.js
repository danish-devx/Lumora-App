const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcGV5ZHR0dmZzeGptd2Jyc25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MjE3NTAsImV4cCI6MjA5NzQ5Nzc1MH0.N9ymG6L8mb7Jmke7PY_zyvitDgzGik4S3scGC50rNYY";
const supabaseUrl = "https://gmpeydttvfsxjmwbrsna.supabase.co";
const client = supabase.createClient(supabaseUrl, supabaseKey);




const secureUpdatePasswordPage = async () => {
   
    const isFromResetLink = window.location.hash.includes('access_token') || 
                            window.location.search.includes('type=recovery');

   
    if (!isFromResetLink) {
      
        const { data: { session } } = await client.auth.getSession();

        if (session) {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    }
};


document.addEventListener("DOMContentLoaded", secureUpdatePasswordPage);





async function handleUpdatePassword(e) {
    if (e) e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

   
    if (newPassword !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Mismatch detected',
            text: 'Security passwords do not match. Please realign your credentials.'
        });
        return;
    }

    Swal.showLoading();

    const { data, error } = await client.auth.updateUser({
        password: newPassword
    });

    if (error) {
        Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: error.message
        });
        return;
    }

  
    Swal.fire({
        icon: 'success',
        title: 'Vault Updated!',
        text: 'Your security core has been successfully updated. Redirecting to Login Portal...',
        confirmButtonColor: '#a01820',
        timer: 3000,
        showConfirmButton: false
    });

   
    setTimeout(() => {
        window.location.href = "index.html";
    }, 3000);
}


const updatePasswordForm = document.getElementById("updatePasswordForm");
if (updatePasswordForm) {
    updatePasswordForm.addEventListener("submit", handleUpdatePassword);
}
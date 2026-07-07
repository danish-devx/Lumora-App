const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcGV5ZHR0dmZzeGptd2Jyc25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MjE3NTAsImV4cCI6MjA5NzQ5Nzc1MH0.N9ymG6L8mb7Jmke7PY_zyvitDgzGik4S3scGC50rNYY";
const supabaseUrl = "https://gmpeydttvfsxjmwbrsna.supabase.co";
const client = supabase.createClient(supabaseUrl, supabaseKey);

const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const createAccountBtn = document.getElementById("createAccountBtn");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const LoginToDashboardBtn = document.getElementById("LoginToDashboardBtn");

const googleLogin = document.getElementById("google-login");
const githubLogin = document.getElementById("github-login");





async function checkActiveSession() {
  const { data: { session }, error } = await client.auth.getSession();

  if (!error && session) {
    window.location.assign("dashboard.html");
  }
}


document.addEventListener("DOMContentLoaded", checkActiveSession);





async function createUserProfileRow(userId, firstName, email) {
    try {
        await client.from('profiles').insert([
            {
                id: userId,
                first_name: firstName,
                email: email,
                avatar_url: 'images/file_00000000161c720885506c38d76251b9.png'
            }
        ]);
    } catch (error) {
        console.error("Profile auto-row creation failed:", error);
    }
}


async function signUp(e) {
    if (e) e.preventDefault(); 
    
    if (!signupEmail.value || !signupPassword.value || !signupName.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Opps...',
            text: 'Please fill all required fields!',
            confirmButtonColor: '#a01820'
        });
        return;
    }

    Swal.showLoading();

    const { data, error } = await client.auth.signUp({
        email: signupEmail.value,
        password: signupPassword.value,
        options: {
            data: { first_name: signupName.value }
        }
    });

    if (error) {
        Swal.fire({ icon: 'error', title: 'Signup Failed', text: error.message });
        return;
    }

    if (data && data.user) {
       
        await createUserProfileRow(data.user.id, signupName.value, signupEmail.value);

        Swal.fire({
            icon: 'success',
            title: 'Account Created!',
            text: 'Your account has been created successfully. Please login to continue.',
            confirmButtonColor: '#a01820'
        });
        
        signupName.value = "";
        signupEmail.value = "";
        signupPassword.value = "";
    }
}


async function signIn(e) {
    if (e) e.preventDefault();

    if (!loginEmail.value || !loginPassword.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Hold on!',
            text: 'Please enter both Email and Password!',
            confirmButtonColor: '#a01820'
        });
        return;
    }

    const { data, error } = await client.auth.signInWithPassword({
        email: loginEmail.value,
        password: loginPassword.value,
    });

    if (error) {
        Swal.fire({ icon: 'error', title: 'Authentication Error', text: error.message });
        return;
    }

    if (data && data.user) {
        
        const { data: profile } = await client.from('profiles').select('id').eq('id', data.user.id).single();
        if (!profile) {
            await createUserProfileRow(data.user.id, data.user.user_metadata?.first_name || "Lumora Elite", data.user.email);
        }

        Swal.fire({
            icon: 'success',
            title: 'Welcome Back!',
            text: 'Redirecting to your premium dashboard...',
            timer: 1500,
            showConfirmButton: false
        });
        
        setTimeout(() => { window.location.assign("dashboard.html"); }, 1500);
        loginEmail.value = "";
        loginPassword.value = "";
    }
}


async function loginWithGoogle(e) {
    if (e) e.preventDefault();
    Swal.showLoading();
    await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'https://lumora-app-green.vercel.app/dashboard.html' }
    });
}

async function loginWithGitHub(e) {
    if (e) e.preventDefault();
    Swal.showLoading(); 
    await client.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: 'https://lumora-app-green.vercel.app/dashboard.html' }
    });
}


if (githubLogin) githubLogin.addEventListener("click", loginWithGitHub);
if (googleLogin) googleLogin.addEventListener("click", loginWithGoogle);
if (createAccountBtn) createAccountBtn.addEventListener("click", signUp);
if (LoginToDashboardBtn) LoginToDashboardBtn.addEventListener("click", signIn);

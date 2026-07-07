const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcGV5ZHR0dmZzeGptd2Jyc25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MjE3NTAsImV4cCI6MjA5NzQ5Nzc1MH0.N9ymG6L8mb7Jmke7PY_zyvitDgzGik4S3scGC50rNYY";
const supabaseUrl = "https://gmpeydttvfsxjmwbrsna.supabase.co";
const client = supabase.createClient(supabaseUrl, supabaseKey);

const avatarFileInput = document.getElementById('avatarFileInput');
const avatarPreview = document.getElementById('avatarPreview');
const uploadTrigger = document.getElementById('uploadTrigger');

const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername"); 

const editProfileForm = document.getElementById("editProfileForm");
const cancelBtn = document.getElementById("cancelBtn");

let currentUserId = null;
let existingAvatarUrl = "";


if (uploadTrigger) {
    uploadTrigger.addEventListener('click', () => avatarFileInput.click());
}


if (avatarFileInput) {
    avatarFileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarPreview.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });
}


async function loadCurrentProfile() {
    try {
        const { data: { user }, error: userError } = await client.auth.getUser();
        if (userError || !user) {
            window.location.assign("login.html");
            return;
        }

        currentUserId = user.id;

     
        const { data: profile, error: profileError } = await client
            .from('profiles')
            .select('*')
            .eq('id', currentUserId)
            .single();

        if (profileError) {
            console.error("Profile load failed:", profileError);
        }

       
        if (profile) {
            profileName.value = profile.first_name || "";
            profileUsername.value = profile.email || user.email || ""; 
            
            if (profile.avatar_url) {
                avatarPreview.src = profile.avatar_url;
                existingAvatarUrl = profile.avatar_url;
            }
        } else {
            profileUsername.value = user.email || "";
        }
    } catch (err) {
        console.error("Initialization exception caught:", err);
    }
}


if (editProfileForm) {
    editProfileForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        if (!currentUserId) return;

        Swal.fire({
            title: 'Updating VIP Credentials...',
            text: 'Synchronizing your authentication and profile records securely.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            let finalAvatarUrl = existingAvatarUrl;
            const file = avatarFileInput.files[0];
            const newName = profileName.value.trim();
            const targetEmail = profileUsername.value.trim();

          
            if (file) {
                const fileExtension = file.name.split('.').pop();
                const uniqueFileName = `${currentUserId}_${Date.now()}.${fileExtension}`;
                const storagePath = `user_avatars/${uniqueFileName}`;

                const { data: storageData, error: storageError } = await client
                    .storage
                    .from('avatars')
                    .upload(storagePath, file, { cacheControl: '3600', upsert: true });

                if (storageError) throw storageError;

                const { data: { publicUrl } } = client
                    .storage
                    .from('avatars')
                    .getPublicUrl(storagePath);

                finalAvatarUrl = publicUrl;
            }

           
            const { data: authData, error: authError } = await client.auth.updateUser({
                email: targetEmail,
                data: { 
                    display_name: newName,
                    avatar: finalAvatarUrl 
                }
            });

            if (authError) throw authError;

           
            const { error: updateError } = await client
                .from('profiles')
                .update({
                    first_name: newName,
                    avatar_url: finalAvatarUrl,
                    email: targetEmail
                })
                .eq('id', currentUserId);

            if (updateError) throw updateError;

       

           Swal.fire({
               icon: 'success',
               title: 'Profile Updated!',
               text: 'Your changes have been saved successfully.',
               confirmButtonColor: '#c8232a'
            }).then(() => {
               window.location.assign("profile.html");
            });

        } catch (error) {
            console.error("Update core failure log:", error);
            Swal.fire({
                icon: 'error',
                title: 'Sync Operation Failed',
                text: error.message || 'Error executing auth-modification queries.',
                confirmButtonColor: '#c8232a'
            });
        }
    });
}


if (cancelBtn) {
    cancelBtn.addEventListener("click", function() {
        window.location.assign("profile.html");
    });
}


loadCurrentProfile();
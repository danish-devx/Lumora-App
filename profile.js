const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcGV5ZHR0dmZzeGptd2Jyc25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MjE3NTAsImV4cCI6MjA5NzQ5Nzc1MH0.N9ymG6L8mb7Jmke7PY_zyvitDgzGik4S3scGC50rNYY";
const supabaseUrl = "https://gmpeydttvfsxjmwbrsna.supabase.co";
const client = supabase.createClient(supabaseUrl, supabaseKey);

const addPostBtn = document.getElementById("addPostBtn");
const editProfileBtn = document.getElementById("editProfileBtn");

const profileImage = document.getElementById("profile-image");
const fullName = document.getElementById("user-fullName");
const uerName = document.getElementById("uername");
const userTotalPost = document.getElementById("userTotalPost");
const showPost = document.getElementById("showPost");


if (addPostBtn) {
    addPostBtn.addEventListener("click", function () {
        window.location.assign("addpost.html");
    });
}

if (editProfileBtn) {
    editProfileBtn.addEventListener("click", function () {
        window.location.assign("editprofile.html");
    });
}


async function showTaskProfilePage() {
    try {
        const { data: { user }, error: userError } = await client.auth.getUser();
        if (userError || !user) {
            window.location.assign("login.html");
            return;
        }

       
        const { data: profile, error: profileError } = await client
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) console.error("Profile Fetch Error: ", profileError);

        if (profile) {
            profileImage.src = profile.avatar_url || 'images/file_00000000161c720885506c38d76251b9.png';
            fullName.innerHTML = `${profile.first_name} <i class="fas fa-circle-check verify-badge"></i>` || "Lumora Member";
            uerName.innerText = `@${(profile.email || '').split('@')[0]}`;
        }

       
        const { data: posts, error: postsError } = await client
            .from('posts')
            .select('*')
            .eq('user_id', user.id)
            .order('id', { ascending: false });

        if (postsError) {
            console.error("Posts Fetch Error: ", postsError);
            return;
        }

        showPost.innerHTML = "";

        if (!posts || posts.length === 0) {
            userTotalPost.innerText = "0";
            showPost.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #8a8a93;">
                    <i class="fas fa-images" style="font-size: 40px; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p style="font-family: 'Inter'; font-size: 14px;">You haven't uploaded any creations yet.</p>
                </div>`;
            return;
        }

        userTotalPost.innerText = posts.length;

        posts.forEach(post => {
            showPost.innerHTML += `
                <div class="grid-post-card" id="post-${post.id}">
                    <div class="grid-post-media">
                        <img src="${post.image_url}" alt="Creation">
                    </div>
                    <div class="grid-post-overlay">
                        <div class="overlay-top">
                            <button class="post-delete-btn" title="Delete Post" onclick="deletePost(${post.id})">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        <div class="overlay-bottom">
                            <p class="post-caption">${post.caption || ''}</p>
                            <div class="post-interactive-bar">
                                <div class="interactive-left">
                                    <span class="grid-stat-item"><i class="fas fa-heart"></i> 0</span>
                                    <span class="grid-stat-item"><i class="fas fa-comment"></i> 0</span>
                                </div>
                                <button class="share-action-btn" title="Share Creation">
                                    <i class="fas fa-share-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

    } catch (err) {
        console.error("Execution Exception: ", err);
    }
}


window.deletePost = async function(id) {
    const result = await Swal.fire({
        title: 'Delete Creation?',
        text: "This premium upload will be permanently removed from your feed.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#c8232a',
        cancelButtonColor: '#4a4a52',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        background: '#ffffff'
       
    });

    if (result.isConfirmed) {
        Swal.showLoading();

        const { error } = await client
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) {
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error',
                confirmButtonColor: '#c8232a',
                background: '#ffffff'
                
            });
        } else {
            Swal.fire({
                title: 'Deleted!',
                text: 'Your creation has been removed.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#ffffff'
                
            });
            
           
            showTaskProfilePage();
        }
    }
};


showTaskProfilePage();
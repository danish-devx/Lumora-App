const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcGV5ZHR0dmZzeGptd2Jyc25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MjE3NTAsImV4cCI6MjA5NzQ5Nzc1MH0.N9ymG6L8mb7Jmke7PY_zyvitDgzGik4S3scGC50rNYY";
const supabaseUrl = "https://gmpeydttvfsxjmwbrsna.supabase.co";
const client = supabase.createClient(supabaseUrl, supabaseKey);


const profileImage = document.getElementById("profile-image");
const profileName = document.getElementById("profile-name");
const profileUsername = document.getElementById("profile-username");
const totalPost = document.getElementById("totalPost");
const show = document.getElementById("show");
const logoutBtn = document.getElementById("logout-btn");
const myprofile = document.getElementById("myprofile");


let currentUser = null;


if (myprofile) {
    myprofile.addEventListener("click", function () {
        window.location.assign("profile.html");
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", signOut);
}


async function checkUserSession() {
    const { data: { session }, error } = await client.auth.getSession();

    if (error || !session) {
        window.location.href = "index.html";
    } else {
        await loadUserData();
        await showTasksDashboard();
    }
}

document.addEventListener("DOMContentLoaded", checkUserSession);



async function loadUserData() {
    try {
        const { data: { user }, error } = await client.auth.getUser();
        if (error || !user) return;
        
        currentUser = user; 

        
        const { data: profile, error: profileError } = await client
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        let currentAvatar = 'images/file_00000000161c720885506c38d76251b9.png';

        if (profileError || !profile) {
           
            const currentName = user.user_metadata?.full_name || user.user_metadata?.first_name || "Lumora Elite";
            
            await client.from('profiles').insert([
                { id: user.id, first_name: currentName, email: user.email, avatar_url: currentAvatar }
            ]);
            
            profileName.innerText = currentName;
            profileUsername.innerText = `@${(user.email).split('@')[0]}`;
        } else {
            profileName.innerText = profile.first_name || "Lumora Elite";
            profileUsername.innerText = `@${(profile.email || '').split('@')[0]}`;
            if (profile.avatar_url) {
                currentAvatar = profile.avatar_url;
            }
        }

    
        if (profileImage) {
            profileImage.src = currentAvatar;
        }

        const { data: userPosts, error: countError } = await client
            .from('posts')
            .select('id')
            .eq('user_id', user.id);

        if (!countError && userPosts) {
            totalPost.innerText = userPosts.length < 10 ? `0${userPosts.length}` : userPosts.length;
        } else {
            totalPost.innerText = "00";
        }

    } catch (err) {
        console.error("Profile data runtime exception:", err);
    }
}



async function showTasksDashboard() {
    try {
       
        const { data: posts, error: postsError } = await client
            .from('posts')
            .select('*')
            .order('id', { ascending: false });

        if (postsError) throw postsError;
        
        show.innerHTML = "";
        
        if (!posts || posts.length === 0) {
            show.innerHTML = `
                <div style="text-align:center; padding: 60px; color:#8a8a93;">
                    <i class="fas fa-image" style="font-size:44px; margin-bottom:16px; opacity:0.4;"></i>
                    <p style="font-size:15px; font-family:'Inter';">No premium uploads found on the timeline.</p>
                </div>`;
            return;
        }

       
        const { data: allProfiles, error: profileError } = await client
            .from('profiles')
            .select('id, first_name, email, avatar_url'); 

      
        posts.forEach(post => {
            
            const userProfile = allProfiles ? allProfiles.find(p => p.id === post.user_id) : null;

           
            const authorName = userProfile?.first_name || "Lumora Member";
            const authorEmail = userProfile?.email || "member@lumora.vip";
            const authorHandle = authorEmail.split('@')[0]; 
            const authorAvatar = userProfile?.avatar_url || "images/file_00000000161c720885506c38d76251b9.png";

            const postHTML = `
              <div class="post-card">
                <div class="post-header">
                  <div class="post-avatar">
                    <img src="${authorAvatar}" alt="${authorName}">
                  </div>
                  <div class="post-user-info">
                    <div class="post-name">${authorName}</div>
                    <div class="post-meta">
                        <span>@${authorHandle}</span>
                        <span class="post-dot"></span>
                        <span>Just now</span>
                    </div>
                </div>
                <div class="post-more"><i class="fas fa-ellipsis"></i></div>
            </div>
            <div class="post-caption">
                ${post.caption || ''}
                <div style="margin-top: 7px; color: #c8232a; font-size: 13px; font-weight: 500;">
                    <span>#LumoraVIP</span> <span>#LuxuryLifestyle</span> <span>#Aesthetic</span> <span>#${authorHandle}</span>
                </div>
            </div>
            <div class="post-image-placeholder">
                <img src="${post.image_url}" style="width:100%; height:100%; object-fit:cover;" alt="Premium Content">
            </div>
            <div class="post-actions">
                <div class="action-btn"><i class="far fa-heart"></i> 0</div>
                <div class="action-btn"><i class="far fa-comment"></i> 0</div>
                <div class="action-btn share-btn"><i class="fas fa-share-nodes"></i><span class="share-text"> Share</span></div>
                <div class="action-btn bookmark-btn"><i class="far fa-bookmark"></i></div>
            </div>
          </div>`;
          
          show.innerHTML += postHTML;
        });
    } catch (error) {
        console.error("Timeline Exception Caught: ", error);
    }
}


async function signOut(e) {
    if (e) e.preventDefault();

    Swal.fire({
        title: 'Are you sure?',
        text: "You will be safely logged out from your active session!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#c8232a', 
        cancelButtonColor: '#4a4a52',
        confirmButtonText: 'Yes, Sign Out',
        background: '#ffffff'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { error } = await client.auth.signOut();
            
            if (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Logout Refused',
                    text: error.message
                });
                return;
            }

            Swal.fire({
                icon: 'success',
                title: 'Logged Out Successfully',
                text: 'See you again soon!',
                timer: 1500,
                showConfirmButton: false
            });

            setTimeout(() => {
                window.location.assign("index.html");
            }, 1500);
        }
    });
}
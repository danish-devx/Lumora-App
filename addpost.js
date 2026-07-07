const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcGV5ZHR0dmZzeGptd2Jyc25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MjE3NTAsImV4cCI6MjA5NzQ5Nzc1MH0.N9ymG6L8mb7Jmke7PY_zyvitDgzGik4S3scGC50rNYY";
const supabaseUrl = "https://gmpeydttvfsxjmwbrsna.supabase.co";
const client = supabase.createClient(supabaseUrl, supabaseKey);

const createPostForm = document.getElementById("createPostForm");
const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const dropzoneContent = document.getElementById("dropzoneContent");
const imagePreview = document.getElementById("imagePreview");
const removePreview = document.getElementById("removePreview");
const postCaption = document.getElementById("postCaption");
const charCount = document.getElementById("charCount");

const cancelBtn = document.getElementById("cancelBtn");





async function checkUserSession() {
  const { data: { session }, error } = await client.auth.getSession();

  if (error || !session) {
    window.location.assign("index.html");
  }
}


document.addEventListener("DOMContentLoaded", checkUserSession);




fileInput.addEventListener("change", function(e) {
  const file = e.target.files[0];
  
  if (file) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
      imagePreview.src = event.target.result;
      imagePreview.classList.remove("hidden");
      removePreview.classList.remove("hidden");
      dropzoneContent.classList.add("hidden");
      dropzone.classList.add("has-file");
    };
    
    reader.readAsDataURL(file);
  }
});


removePreview.addEventListener("click", function(e) {
  e.stopPropagation(); 
  fileInput.value = ""; 
  imagePreview.src = "";
  imagePreview.classList.add("hidden");
  removePreview.classList.add("hidden");
  dropzoneContent.classList.remove("hidden");
  dropzone.classList.remove("has-file");
});


dropzone.addEventListener("click", () => {
  if (fileInput.value === "") {
    fileInput.click();
  }
});


postCaption.addEventListener("input", function() {
  const targetLength = this.value.length;
  charCount.textContent = targetLength;
  
  if (targetLength > 2200) {
    charCount.style.color = "#c8232a"; 
  } else {
    charCount.style.color = "#8a8a93";
  }
});


createPostForm.addEventListener("submit", async function(event) {
  event.preventDefault(); 
  
  const file = fileInput.files[0];
  const captionValue = postCaption.value.trim();
  

  if (!file) {
    Swal.fire({
      icon: 'warning',
      title: 'Upload Failed',
      text: 'Please select an image file to upload first.',
      confirmButtonColor: '#c8232a'
    });
    return;
  }

 
  if (!captionValue) {
    Swal.fire({
      icon: 'warning',
      title: 'Caption Required',
      text: 'Please write a caption for your post before publishing.',
      confirmButtonColor: '#c8232a'
    });
    return;
  }

 
  Swal.fire({
    title: 'Uploading your post...',
    text: 'Sending your premium shot to Lumora servers.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    
    const { data: { user }, error: userError } = await client.auth.getUser();
    
    if (userError || !user) {
      throw new Error("User session not found. Please log in again.");
    }

   
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;
    const storagePath = `posts/${user.id}/${uniqueFileName}`;

  
    const { data: storageData, error: storageError } = await client
      .storage
      .from('post-images')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (storageError) throw storageError;

   
    const { data: { publicUrl } } = client
      .storage
      .from('post-images')
      .getPublicUrl(storagePath);

  
    const { data: dbData, error: dbError } = await client
      .from('posts')
      .insert([
        {
          user_id: user.id,
          image_url: publicUrl,
          caption: captionValue,
        }
      ]);

    if (dbError) throw dbError;

   
    Swal.fire({
      icon: 'success',
      title: 'Post Uploaded!',
      text: 'Your media and caption have been successfully uploaded to your timeline.',
      confirmButtonColor: '#c8232a'
    }).then(() => {
      window.location.href = "dashboard.html";
    });

  } catch (error) {
    console.error("Post Creation Error Log:", error);
    Swal.fire({
      icon: 'error',
      title: 'Upload Failed',
      text: error.message || 'Something went wrong while uploading your post. Please try again.',
      confirmButtonColor: '#c8232a'
    });
  }
});






if (cancelBtn) {
  cancelBtn.addEventListener("click", function () {
   
    postCaption.value = "";
    fileInput.value = "";
    charCount.textContent = "0";
    charCount.style.color = "#8a8a93";

    
    imagePreview.src = "";
    imagePreview.classList.add("hidden");
    removePreview.classList.add("hidden");
    dropzoneContent.classList.remove("hidden");
    dropzone.classList.remove("has-file");

    
    window.location.assign("profile.html");
  });
}

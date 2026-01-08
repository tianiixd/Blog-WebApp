declare const Swal: any;
declare const axios: any;

const composeForm = document.getElementById("composeBlog") as HTMLFormElement;

const MAX_TITLE_LENGTH = 50;
const MAX_POST_LENGTH = 500;

composeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const titleInput = document.getElementById("blogTitle") as HTMLInputElement;
  const postInput = document.getElementById(
    "postMessage"
  ) as HTMLTextAreaElement;

  const title = titleInput.value.trim();
  const post = postInput.value.trim();

  if (!title || !post) {
    Swal.fire({
      icon: "error",
      title: "Please fill in all fields",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    return;
  }

  if (title.length > MAX_TITLE_LENGTH) {
    Swal.fire({
      icon: "warning",
      title: `Title is too long! (Max ${MAX_TITLE_LENGTH} chars)`,
      text: `You have ${title.length} characters.`,
      showConfirmButton: true,
      confirmButtonText: "Got it!",
      heightAuto: false,
    });
    return;
  }

  if (post.length > MAX_POST_LENGTH) {
    Swal.fire({
      icon: "warning",
      title: `Post is too long! (Max ${MAX_POST_LENGTH} chars)`,
      text: `You have ${post.length} characters.`,
      showConfirmButton: true,
      confirmButtonText: "Got it!",
      heightAuto: false,
    });
    return;
  }

  try {
    const response = await axios.post("/compose", {
      title: title,
      post: post,
    });

    if (response.data.success) {
      Swal.fire({
        icon: "success",
        title: "Post published successfully!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      titleInput.value = "";
      postInput.value = "";
    }
  } catch (error: any) {
    console.log("Network Error:", error);
    let msg = "Something went wrong!";

    // chinicheck neto kung may error sa server
    if (error.response && error.response.data && error.response.data.message) {
      msg = error.response.data.message;
    }

    Swal.fire({
      icon: "error",
      title: msg,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }
});

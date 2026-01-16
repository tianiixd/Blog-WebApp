import { compose } from "node:stream";

declare const Swal: any;
declare const axios: any;

const deletePost = async (id: string) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      const response = await axios.delete(`/delete/${id}`);
      if (response.data.success) {
        toastHelper("Your post has been deleted!", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      console.log(error || error.message);
      toastHelper("Something went wrong while deleting.", "error");
    }
  }
};

(window as any).deletePost = deletePost;

const composeForm = document.getElementById("composeBlog") as HTMLFormElement;

if (composeForm) {
  const MAX_TITLE_LENGTH: number = 50;
  const MAX_CONTENT_LENGTH: number = 500;
  const MAX_AUTHOR_LENGTH: number = 30;

  composeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const getId = document.getElementById("postId") as HTMLInputElement;
    const titleInput = document.getElementById("blogTitle") as HTMLInputElement;
    const contentInput = document.getElementById(
      "blogContent"
    ) as HTMLTextAreaElement;
    const authorInput = document.getElementById(
      "blogAuthor"
    ) as HTMLInputElement;

    const blogTitle = titleInput.value.trim();
    const blogContent = contentInput.value.trim();
    const blogAuthor = authorInput.value.trim();

    if (!blogTitle || !blogContent || !blogAuthor) {
      toastHelper("Please fill in all fields", "error");
      return;
    }

    if (blogTitle.length > MAX_TITLE_LENGTH) {
      dialogHelper(
        `Title is too long! (Max ${MAX_TITLE_LENGTH} chars)`,
        `You have ${blogTitle.length} characters.`,
        `warning`
      );
      return;
    } else if (blogContent.length > MAX_CONTENT_LENGTH) {
      dialogHelper(
        `Content is too long! (Max ${MAX_CONTENT_LENGTH} chars)`,
        `You have ${blogContent.length} characters.`,
        `warning`
      );
      return;
    } else if (blogAuthor.length > MAX_AUTHOR_LENGTH) {
      dialogHelper(
        `Author is too long! (Max ${MAX_AUTHOR_LENGTH} chars)`,
        `You have ${blogAuthor.length} characters.`,
        `warning`
      );
      return;
    }

    try {
      const id = getId.value;
      let response;

      if (id) {
        response = await axios.patch(`/edit/${id}`, {
          blogTitle: blogTitle,
          blogContent: blogContent,
          blogAuthor: blogAuthor,
        });
      } else {
        response = await axios.post("/compose", {
          blogTitle: blogTitle,
          blogContent: blogContent,
          blogAuthor: blogAuthor,
        });
      }

      const result = response.data;

      console.log(result);

      if (result.success) {
        if (id) {
          toastHelper("Post updated successfully!", "success");
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        } else {
          toastHelper("Post published successfully!", "success");
          titleInput.value = "";
          contentInput.value = "";
          authorInput.value = "";
        }
      }
    } catch (error: any) {
      console.log("Network Error:", error);
      let msg = "Something went wrong!";

      // chinicheck neto kung may error sa server
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        msg = error.response.data.message;
      }

      toastHelper(msg, "error");
    }
  });
}

function dialogHelper(title: string, message: string = "", icon: string) {
  Swal.fire({
    icon: icon.toLowerCase(),
    title: title,
    text: message,
    showConfirmButton: true,
    confirmButtonText: "Got it!",
    heightAuto: false,
    allowOutsideClick: false,
  });
}

function toastHelper(title: string, icon: string) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast: any) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  Toast.fire({
    title: title,
    icon: icon.toLowerCase(),
  });
}

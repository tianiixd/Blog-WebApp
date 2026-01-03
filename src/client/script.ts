declare const Swal: any;

const composeForm = document.getElementById("composeBlog") as HTMLFormElement;

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

  try {
    const response = await fetch("/compose", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, post }),
    });

    const result = await response.json();

    if (result.success) {
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
    } else {
      Swal.fire({
        icon: "error",
        title: result.message,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  } catch (error) {
    console.error("Network Error:", error);
    console.log(error);
  }
});

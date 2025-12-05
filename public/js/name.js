document.addEventListener("DOMContentLoaded", () => {
  const first_name = "Christopher"; // oder was auch immer~
  const last_name = "Werner";

  document.querySelectorAll(".name").forEach(el => {
    el.textContent = first_name + " " + last_name;
  });
});

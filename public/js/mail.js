document.addEventListener("DOMContentLoaded", () => {
  const user = "chris2000sp";
  const domain = "mailbox.org";
  const el = document.getElementById("mail");
  if (el) el.textContent = user + "@" + domain;
});

export function toast(message, isError = false) {
  const msg = document.getElementById("formMsg");
  if (!msg) {
    alert(message);
    return;
  }
  msg.textContent = message;
  msg.className = "text-sm " + (isError ? "error" : "success");
  setTimeout(() => {
    msg.textContent = "";
    msg.className = "text-sm";
  }, 2500);
}

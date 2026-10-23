
const StatusSwitch = document.getElementById("StatusSwitch");
const StatusText = document.getElementById("StatusText");

function UpdateStatus() {
    const IsOnline = StatusSwitch.checked;

    StatusText.textContent = IsOnline ? "ONLINE" : "OFFLINE";
    StatusText.style.color = IsOnline ? "#00e676" : "#ff3333";
}

StatusSwitch.addEventListener("change", UpdateStatus);

UpdateStatus();

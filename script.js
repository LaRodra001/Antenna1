
const StatusSwitch = document.getElementById("StatusSwitch");
const StatusText = document.getElementById("StatusText");

// For local testing.
// When deployed, replace this with your backend's real URL.
const API_URL = "http://127.0.0.1:5000";

let IsUpdating = false;

function RenderStatus(IsOnline) {
    StatusSwitch.checked = IsOnline;
    StatusText.textContent = IsOnline ? "ONLINE" : "OFFLINE";
    StatusText.style.color = IsOnline ? "#00e676" : "#ff3333";
}

async function LoadStatus() {
    try {
        const Response = await fetch(`${API_URL}/api/antenna/status`);

        if (!Response.ok) {
            throw new Error("Could not get antenna status");
        }

        const Data = await Response.json();
        RenderStatus(Data.online);
    } catch (Error) {
        StatusText.textContent = "UNREACHABLE";
        StatusText.style.color = "#ff3333";
        console.error(Error);
    }
}

async function UpdateStatus() {
    if (IsUpdating) return;

    IsUpdating = true;
    StatusSwitch.disabled = true;

    const RequestedStatus = StatusSwitch.checked;
    const Password = prompt("Admin password:");

    if (Password === null || Password.length === 0) {
        await LoadStatus();
        StatusSwitch.disabled = false;
        IsUpdating = false;
        return;
    }

    try {
        const Response = await fetch(`${API_URL}/api/antenna/power`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                online: RequestedStatus,
                password: Password
            })
        });

        const Data = await Response.json();

        if (!Response.ok) {
            throw new Error(Data.error || "Request failed");
        }

        RenderStatus(Data.online);
    } catch (Error) {
        alert(`Could not change antenna status: ${Error.message}`);
        await LoadStatus();
    } finally {
        StatusSwitch.disabled = false;
        IsUpdating = false;
    }
}

StatusSwitch.addEventListener("change", UpdateStatus);

LoadStatus();

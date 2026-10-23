
const StatusSwitch = document.getElementById("StatusSwitch");
const StatusText = document.getElementById("StatusText");
const MessageText = document.getElementById("MessageText");
const PositionText = document.getElementById("PositionText");
const RequestsText = document.getElementById("RequestsText");
let ApiBaseUrl = "";
let IsUpdating = false;

async function FetchJson(Url, Options = {}) {
    const Controller = new AbortController();
    const Timeout = setTimeout(() => Controller.abort(), 5000);
    try {
        const Response = await fetch(Url, { ...Options, signal: Controller.signal });
        const Data = await Response.json().catch(() => ({}));
        if (!Response.ok) {
            throw new Error(Data.message || Data.error || `HTTP ${Response.status}`);
        }
        return Data;
    } finally {
        clearTimeout(Timeout);
    }
}

function RenderStatus(IsOnline) {
    StatusSwitch.checked = IsOnline;
    StatusText.textContent = IsOnline ? "ONLINE" : "OFFLINE";
    document.body.classList.toggle("isOnline", IsOnline);
    document.body.classList.remove("hasError");
}

async function LoadStatus() {
    if (!ApiBaseUrl || IsUpdating) return;
    let PowerError = "";
    try {
        const Data = await FetchJson(`${ApiBaseUrl}/api/status`);
        RenderStatus(Data.online === true);
        RequestsText.textContent = Number.isInteger(Data.requests) ? String(Data.requests) : "--";
        StatusSwitch.disabled = false;
        MessageText.textContent = "";
    } catch (Error) {
        StatusText.textContent = "UNREACHABLE";
        StatusSwitch.disabled = true;
        document.body.classList.remove("isOnline");
        document.body.classList.add("hasError");
        MessageText.textContent = `Backend connection failed: ${Error.message}`;
    }
}

async function UpdateStatus() {
    if (IsUpdating || !ApiBaseUrl) return;
    IsUpdating = true;
    StatusSwitch.disabled = true;
    const RequestedStatus = StatusSwitch.checked;
    const AdminToken = window.prompt("Administrator token (not stored by this page):");
    if (!AdminToken) {
        IsUpdating = false;
        await LoadStatus();
        return;
    }

    try {
        const Data = await FetchJson(`${ApiBaseUrl}/api/power`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${AdminToken}`
            },
            body: JSON.stringify({ online: RequestedStatus })
        });
        RenderStatus(Data.online === true);
        MessageText.textContent = "Power state updated by backend.";
    } catch (Error) {
        PowerError = Error.message;
    } finally {
        IsUpdating = false;
        await LoadStatus();
        if (PowerError) {
            MessageText.textContent = `Power request failed: ${PowerError}`;
        }
    }
}

async function InitializePage() {
    StatusSwitch.disabled = true;
    try {
        const Config = await FetchJson("./antenna.json");
        document.getElementById("antennaName").textContent = Config.name;
        document.getElementById("antennaId").textContent = Config.id;
        PositionText.textContent = `X ${Config.position.x} m  /  Y ${Config.position.y} m`;
        ApiBaseUrl = String(Config.apiBaseUrl || "").replace(/\/+$/, "");
        if (!ApiBaseUrl || ApiBaseUrl.includes("YOUR-BACKEND")) {
            StatusText.textContent = "NOT CONFIGURED";
            MessageText.textContent = "Set this antenna's public HTTPS backend URL in antenna.json.";
            return;
        }
        await LoadStatus();
        window.setInterval(LoadStatus, 15000);
    } catch (Error) {
        StatusText.textContent = "CONFIG ERROR";
        MessageText.textContent = `Could not load antenna.json: ${Error.message}`;
    }
}

StatusSwitch.addEventListener("change", UpdateStatus);
InitializePage();

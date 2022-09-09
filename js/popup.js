$("#debug-dialog").click(function () {
	chrome.runtime.sendMessage({ debug: "dialog" });
});
$("#debug-clear").click(function () {
	chrome.runtime.sendMessage({ debug: "clear" });
});
$("#c-yes-btn").click(function () {
	chrome.runtime.sendMessage({ debug: { choice: "yes" } });
});
$("#c-no-btn").click(function () {
	chrome.runtime.sendMessage({ debug: { choice: "no" } });
});
$("#c-ignore-btn").click(function () {
	chrome.runtime.sendMessage({ debug: { choice: "ignore" } });
});

chrome.runtime.onMessage.addListener((request) => {
	$("#msg").text(JSON.stringify(request)); // Debug line

	if (request.payload) {
		updateDebugText(request.payload);
	}
});

chrome.runtime.sendMessage("getData", function (response) {
	$("#msg").text(JSON.stringify(response)); // Debug line

	updateDebugText(response);
});

function updateDebugText(data) {
	$("#c-yes").text(data["c-yes"] || "-");
	$("#c-no").text(data["c-no"] || "-");
	$("#c-ignore").text(data["c-ignore"] || "-");
}
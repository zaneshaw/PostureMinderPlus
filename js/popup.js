const popup = {};

popup.init = () => {
	popup.debug.init();
}

popup.debug = {
	init: () => {
		$("#debug-dialog").click(() => {
			chrome.runtime.sendMessage({ debug: "dialog" });
		});
		$("#debug-clear").click(() => {
			chrome.runtime.sendMessage({ debug: "clear" });
		});
		$("#c-yes-btn").click(() => {
			chrome.runtime.sendMessage({ debug: { choice: "yes" } });
		});
		$("#c-no-btn").click(() => {
			chrome.runtime.sendMessage({ debug: { choice: "no" } });
		});
		$("#c-ignore-btn").click(() => {
			chrome.runtime.sendMessage({ debug: { choice: "ignore" } });
		});

		chrome.runtime.onMessage.addListener((request) => {
			$("#msg").text(JSON.stringify(request)); // Debug line

			if (request.payload) {
				popup.debug.updateDebugText(request.payload);
			}
		});

		chrome.runtime.sendMessage("getData", (response) => {
			$("#msg").text(JSON.stringify(response)); // Debug line

			popup.debug.updateDebugText(response);
		});
	},
	updateDebugText: (data) => {
		$("#c-yes").text(data["c-yes"] || "-");
		$("#c-no").text(data["c-no"] || "-");
		$("#c-ignore").text(data["c-ignore"] || "-");
	}
}

popup.init();
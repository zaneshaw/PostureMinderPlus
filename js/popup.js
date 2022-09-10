const popup = {};

popup.init = () => {
	popup.debug.init();
}

popup.choices = {
	total: []
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
			$("#msg").text(JSON.stringify(request));

			if (request.choices) popup.debug.updateChoiceButtons(request.choices);
		});

		chrome.runtime.sendMessage("getChoices", (response) => {
			$("#msg").text(JSON.stringify(response));

			if (response.choices) popup.debug.updateChoiceButtons(response.choices);
		});
	},
	updateChoiceButtons: (data) => {
		const total = {};
		data.forEach((x) => total[x] = (total[x] || 0) + 1);
		
		$("#c-yes").text(total.yes || "-");
		$("#c-no").text(total.no || "-");
		$("#c-ignore").text(total.ignore || "-");
		
		popup.choices.total = total;
	}
}

popup.init();
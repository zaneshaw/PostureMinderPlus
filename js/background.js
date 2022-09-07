const app = {};

app.init = () => {
	// app.reminder.init();
	app.listeners.init();
}

app.reminder = {
	init: () => {
		chrome.alarms.create("reminder", { delayInMinutes: 0.1, periodInMinutes: 0.1 });

		chrome.alarms.onAlarm.addListener(function (alarm) {
			if (alarm.name == "reminder") {
				app.reminder.display();
			}
		});
	},
	display: () => {
		const options = {
			type: "basic",
			title: "Posture Check!",
			message: "Were you sitting up straight?",
			iconUrl: "/img/spine.png",
			buttons: [{ title: "Yes" }, { title: "No" }],
			requireInteraction: false
		};

		chrome.notifications.getPermissionLevel(function (permission) {
			if (permission === "granted") {
				chrome.notifications.create("notification", options);

				setTimeout(function () {
					chrome.notifications.clear("notification");
				}, 5000);
			}
		});
	}
}

app.listeners = {
	init: () => {
		chrome.runtime.onMessage.addListener((msg) => {
			if (msg = "debug") app.reminder.display();
		});
	}
}

app.init();
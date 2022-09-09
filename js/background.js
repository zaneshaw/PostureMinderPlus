const app = {};

app.init = () => {
	// app.reminder.init();
	app.storage.init();
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
			requireInteraction: true
		};

		chrome.notifications.getPermissionLevel(function (permission) {
			if (permission === "granted") {
				chrome.notifications.create("notification", options);
			}
		});
	}
}

app.storage = {
	init: () => {

	},
	data: async () => {
		let keys = await chrome.storage.sync.get(null);
		return keys;
	},
	increment: async (key) => {
		let data = await app.storage.data();
		val = data[key] || 0;

		let newVal = val + 1;

		chrome.storage.sync.set({ [key]: newVal });

		console.log(`Updated '${key}' (${val} => ${newVal})`);
	}
}

app.listeners = {
	init: () => {
		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			if (request == "debug") app.reminder.display();
			if (request === "getData") {
				app.storage.data().then(async () => {
					const data = await app.storage.data();
					sendResponse(data);
				});
			};

			return true;
		});

		chrome.notifications.onButtonClicked.addListener(function (id, i) {
			if (id === "notification") {
				if (i === 0) {
					app.storage.increment("c-yes");
				} else if (i === 1) {
					app.storage.increment("c-no");
				}
			}
		});

		chrome.notifications.onClosed.addListener(function (id) {
			if (id === "notification") {
				app.storage.increment("c-ignore");
			}
		})
	}
}

app.init();
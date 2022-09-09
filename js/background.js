const app = {};

app.init = () => {
	// app.reminder.init();
	app.storage.init();
	app.listeners.init();
}

app.reminder = {
	init: () => {
		chrome.alarms.create("reminder", { delayInMinutes: 0.1, periodInMinutes: 0.1 });

		chrome.alarms.onAlarm.addListener((alarm) => {
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

		chrome.notifications.getPermissionLevel((permission) => {
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

		await chrome.storage.sync.set({ [key]: newVal });
		chrome.runtime.sendMessage({ payload: await app.storage.data() });

		console.debug(`Updated '${key}' (${val} => ${newVal})`);
	},
	clear: async () => {
		console.debug("Clearing storage...");

		chrome.storage.sync.clear();
		chrome.runtime.sendMessage({ payload: await app.storage.data() });
	}
}

app.listeners = {
	init: () => {
		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			if (request.debug) {
				if (request.debug === "dialog") app.reminder.display();
				if (request.debug === "clear") app.storage.clear();
				if (request.debug.choice) {
					if (request.debug.choice === "yes") app.storage.increment("c-yes");
					if (request.debug.choice === "no") app.storage.increment("c-no");
					if (request.debug.choice === "ignore") app.storage.increment("c-ignore");
				};
			}

			if (request === "getData") {
				app.storage.data().then(async () => {
					const data = await app.storage.data();
					sendResponse(data);
				});
			};

			return true;
		});

		chrome.notifications.onButtonClicked.addListener((id, i) => {
			if (id === "notification") {
				if (i === 0) {
					app.storage.increment("c-yes");
				} else if (i === 1) {
					app.storage.increment("c-no");
				}
			}
		});

		chrome.notifications.onClosed.addListener((id) => {
			if (id === "notification") {
				app.storage.increment("c-ignore");
			}
		})
	}
}

app.init();
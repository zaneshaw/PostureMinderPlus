const app = {};

app.init = () => {
	// app.reminder.init();
	app.storage.init();
	app.listeners.init();
}

app.reminder = {
	options: {
		type: "basic",
		title: "Posture Check!",
		message: "Were you sitting up straight?",
		iconUrl: "/img/spine.png",
		buttons: [{ title: "Yes" }, { title: "No" }],
		requireInteraction: true
	},
	init: () => {
		chrome.alarms.create("reminder", { delayInMinutes: 0.1, periodInMinutes: 0.1 });

		chrome.alarms.onAlarm.addListener((alarm) => {
			if (alarm.name == "reminder") {
				app.reminder.display();
			}
		});
	},
	display: () => {
		chrome.notifications.getPermissionLevel((permission) => {
			if (permission === "granted") {
				chrome.notifications.create("notification", app.reminder.options);
			}
		});
	}
}

app.storage = {
	init: () => {

	},
	choices: {
		get: async () => {
			let data = await chrome.storage.local.get({ "choices": [] });
			return data.choices;
		},
		clear: async () => {
			console.debug("Clearing choices...");

			chrome.storage.local.remove("choices");
			chrome.runtime.sendMessage({ choices: [] });
		},
		increment: async (value) => {
			const data = await app.storage.choices.get();

			data.push(value);

			const obj = { choices: data };
			await chrome.storage.local.set(obj);
			chrome.runtime.sendMessage(obj);

			console.debug(`Incremented '${value}'`);
		}
	}
}

app.listeners = {
	init: () => {
		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			if (request.debug) {
				if (request.debug === "dialog") app.reminder.display();
				if (request.debug === "clear") app.storage.choices.clear();
				if (request.debug.choice) app.storage.choices.increment(request.debug.choice);
			}

			if (request === "getChoices") {
				app.storage.choices.get().then((data) => {
					sendResponse({ choices: data });
				});
			};

			return true;
		});

		chrome.notifications.onButtonClicked.addListener((id, i) => {
			if (id === "notification") {
				if (i === 0) {
					app.storage.choices.increment("yes");
				} else if (i === 1) {
					app.storage.choices.increment("no");
				}
			}
		});

		chrome.notifications.onClosed.addListener((id) => {
			if (id === "notification") {
				app.storage.choices.increment("ignore");
			}
		})
	}
}

app.init();
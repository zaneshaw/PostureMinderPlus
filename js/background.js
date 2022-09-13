const app = {};

app.init = function () {
	// app.reminder.init();
	this.storage.init();
	this.listeners.init();
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
	init: function () {
		chrome.alarms.create("reminder", { delayInMinutes: 0.1, periodInMinutes: 0.1 });

		chrome.alarms.onAlarm.addListener(function (alarm) {
			if (alarm.name == "reminder") {
				this.display();
			}
		});
	},
	display: function () {
		chrome.notifications.getPermissionLevel((permission) => {
			if (permission === "granted") {
				chrome.notifications.create("notification", this.options);
			}
		});
	}
}

app.storage = {
	init: function () {

	},
	choices: {
		get: async function () {
			const data = await chrome.storage.local.get({ "choices": {} });
			return data.choices;
		},
		clear: async function () {
			console.debug("Clearing choices...");

			chrome.storage.local.remove("choices");
			chrome.runtime.sendMessage({ choices: [] });
		},
		increment: async function (value) {
			const date = new Date().toISOString().split("T")[0]; // Get current date
			const data = await this.get(); // Get choices data

			// Initialise default values
			if (!data[date]) {
				data[date] = { "yes": 0, "no": 0, "ignore": 0 };
			}

			// Increment value
			data[date][value] += 1;

			// Apply data
			const res = { choices: data };
			await chrome.storage.local.set(res);
			chrome.runtime.sendMessage(res);

			console.debug(`Incremented '${value}' (${date})`);
		}
	}
}

app.listeners = {
	init: function () {
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
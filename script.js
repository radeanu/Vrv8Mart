window.onload = main;

function useStorage() {
	const app = window?.Telegram?.WebApp;
	const userId = app?.initDataUnsafe?.user?.id?.toString();
	const tgStorage = app?.CloudStorage;

	const isTelegram = Boolean(userId && tgStorage);

	function getItem(key) {
		if (isTelegram) {
			return new Promise((resolve) => {
				tgStorage.getItem(key, (error, value) => {
					if (error) {
						console.log(error);
						return resolve(null);
					}
					resolve(value ?? null);
				});
			});
		}

		try {
			const value = window.localStorage.getItem(key);
			return Promise.resolve(value);
		} catch (_) {
			return Promise.resolve(null);
		}
	}

	function setItem(key, value) {
		if (isTelegram) {
			return new Promise((resolve) => {
				tgStorage.setItem(key, value, (error, success) => {
					resolve(!error && !!success);
				});
			});
		}

		try {
			window.localStorage.setItem(key, value);
			return Promise.resolve(true);
		} catch (_) {
			return Promise.resolve(false);
		}
	}

	return { getItem, setItem, isTelegram };
}

function main() {
	const { getItem, setItem, isTelegram } = useStorage();

	const app = window.Telegram?.WebApp;
	const user = app?.initDataUnsafe?.user;
	const backendUrl = 'https://gloomily-agile-dory.cloudpub.ru';

	app?.disableVerticalSwipes();
	app?.ready();
	app?.expand();

	if (app.isFullscreen) {
		document.getElementsByTagName('header')[0].style.paddingTop = '120px';
	}

	if (user) {
		const preEl = document.createElement('pre');
		preEl.style.color = 'white';
		preEl.style.backgroundColor = 'black';
		preEl.style.padding = '10px';
		preEl.style.borderRadius = '5px';
		preEl.style.fontSize = '12px';
		preEl.style.fontFamily = 'monospace';
		preEl.style.whiteSpace = 'pre-wrap';
		preEl.textContent = JSON.stringify(user, null, 4);
		preEl.style.minHeight = '400px';
		document.body.appendChild(preEl);
	}

	const FORM_KEY = 'vrv8mart_choice';
	const form = document.getElementById('day-form');
	const resultSection = document.getElementById('result-section');
	const resultList = document.getElementById('result-list');

	setTimeout(async () => {
		await restoreForm();
	}, 100);

	function getSelected() {
		const data = { morning: [], day: [], evening: [] };
		form.querySelectorAll('input[type="checkbox"]:checked').forEach(function (input) {
			const name = input.getAttribute('name');
			if (data[name]) data[name].push(input.value);
		});
		return data;
	}

	function showResult(data) {
		const all = [
			...data.morning.map(function (v) {
				return { period: 'Утро', value: v };
			}),
			...data.day.map(function (v) {
				return { period: 'День', value: v };
			}),
			...data.evening.map(function (v) {
				return { period: 'Вечер', value: v };
			}),
		];
		resultList.innerHTML = '';
		all.forEach(function (item) {
			const li = document.createElement('li');
			li.textContent = item.value;
			resultList.appendChild(li);
		});
		resultSection.hidden = all.length === 0;
	}

	async function submitForm(data) {
		const json = JSON.stringify(data);

		await setItem(FORM_KEY, json);

		if (user) {
			fetch(`${backendUrl}/submit`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					user: {
						id: user.id,
						first_name: user.first_name,
						last_name: user.last_name,
						username: user.username,
					},
					data,
				}),
			}).catch(function (err) {
				console.warn('Notify admin failed', err);
			});
		}

		showResult(data);

		if (!resultSection.hidden) {
			resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	async function restoreForm() {
		try {
			const saved = await getItem(FORM_KEY);
			if (!saved) return;

			const data = JSON.parse(saved);

			form.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
				const name = input.getAttribute('name');
				const value = input.value;
				if (data[name] && data[name].indexOf(value) !== -1) {
					input.checked = true;
				}
			});

			showResult(data);
		} catch (err) {
			console.warn('Restore failed', err);
		}
	}

	form.addEventListener('submit', async function (e) {
		e.preventDefault();
		const data = getSelected();

		await submitForm(data);
	});
}

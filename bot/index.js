import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const USER_CHAT_ID = process.env.USER_CHAT_ID;

app.use(express.json());

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	if (req.method === 'OPTIONS') return res.sendStatus(204);
	next();
});

app.post('/submit', async (req, res) => {
	try {
		if (!BOT_TOKEN || !ADMIN_CHAT_ID || !USER_CHAT_ID) {
			console.warn('BOT_TOKEN or ADMIN_CHAT_ID or USER_CHAT_ID not set');
			return res.status(503).json({ ok: false, error: 'Server not configured' });
		}

		const { user, data } = req.body || {};

		if (!data || typeof data !== 'object') {
			console.warn('Missing data');
			return res.status(400).json({ ok: false, error: 'Missing data' });
		}

		if (user?.id.toString() !== USER_CHAT_ID.toString()) {
			console.warn('User is not allowed to submit');
			return res.status(400).json({ ok: false, error: 'User is not allowed to submit' });
		}

		const userName = user
			? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || `ID ${user.id}`
			: 'Неизвестный пользователь';
		const userLine = user
			? `👤 ${userName} (id: ${user.id}${user.username ? `, @${user.username}` : ''})`
			: '👤 Аноним';

		const morningMSG = data.morning.map((v) => `\t\t\t\t\t - ${v}`).join('\n');
		const dayMSG = data.day.map((v) => `\t\t\t\t\t - ${v}`).join('\n');
		const eveningMSG = data.evening.map((v) => `\t\t\t\t\t - ${v}`).join('\n');

		const text = [
			'🌸 Новый выбор на 8 марта',
			'',
			userLine,
			'',
			'\n☀️ Утро:\n' + morningMSG,
			'\n🌤 День:\n' + dayMSG,
			'\n🌙 Вечер:\n' + eveningMSG,
		].join('\n');

		const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: ADMIN_CHAT_ID,
				text,
				parse_mode: 'HTML',
			}),
		});
		const result = await tgRes.json();

		if (!result.ok) {
			console.error('Telegram API error:', result);
			return res.status(502).json({ ok: false, error: result.description || 'Telegram error' });
		}

		return res.status(200).json({ ok: true });
	} catch (err) {
		console.error('Submit error:', err);
		res.status(500).json({ ok: false, error: String(err.message) });
	}
});

app.listen(PORT, 'localhost', () => {
	console.log(`Bot server listening on http://localhost:${PORT}`);
});

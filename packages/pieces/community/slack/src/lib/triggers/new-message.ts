import { Property, TriggerStrategy, createTrigger } from '@activepieces/pieces-framework';
import { slackAuth } from '../../';

export const newMessageTrigger = createTrigger({
	auth: slackAuth,
	name: 'new-message',
	displayName: 'New Public Message Posted Anywhere',
	description: 'Triggers when a new message is posted to any channel.',
	props: {
		ignoreBots: Property.Checkbox({
			displayName: 'Ignore Bot Messages ?',
			required: false,
			defaultValue: false,
		}),
		keyword: Property.ShortText({
			displayName: 'Keyword',
			description: 'The keyword to search for in messages. Leave empty to trigger on all messages.',
			required: false,
		}),
		includeThreads: Property.Checkbox({
			displayName: 'Include Thread Messages',
			description: 'If enabled, also triggers on matches in thread replies',
			required: false,
			defaultValue: true,
		}),
		matchWholeWord: Property.Checkbox({
			displayName: 'Match Whole Word Only',
			description: 'If enabled, only matches the keyword as a complete word (e.g. "test" won\'t match "testing"). Leave empty if no keyword.',
			required: false,
			defaultValue: false,
		}),
	},

	type: TriggerStrategy.APP_WEBHOOK,
	sampleData: {
		text: 'Hello world!',
		channel: 'C1234567890',
		user: 'U1234567890',
		channel_type: 'channel',
		ts: '1234567890.123456'
	},
	onEnable: async (context) => {
		// Older OAuth2 has team_id, newer has team.id
		const teamId = context.auth.data['team_id'] ?? context.auth.data['team']['id'];
		context.app.createListeners({
			events: ['message'],
			identifierValue: teamId,
		});
	},
	onDisable: async (context) => {
		// Ignored
	},

	run: async (context) => {
		const payloadBody = context.payload.body as PayloadBody;
		const {ignoreBots, keyword, includeThreads, matchWholeWord} = context.propsValue;

		if (ignoreBots && payloadBody.event.bot_id) {
			return [];
		}
		// check if it's channel message
		if (!['channel','group'].includes(payloadBody.event.channel_type)) {
			if (!includeThreads || !payloadBody.event.thread_ts) {
				return [];
			}
		}	

		// if text is not provided, return
		if (!payloadBody.event.text || !payloadBody.event.text.trim()) {
			return [];
		}

		// if keyword is provided, check if the message contains the keyword
		if (keyword && keyword.trim()) {
			if (!payloadBody.event.text) {
				return [];
			}
	
			const messageText = payloadBody.event.text.toLowerCase();
			const searchKeyword = keyword.toLowerCase();
			let keywordFound = false;
	
			if (matchWholeWord) {
				const wordRegex = new RegExp(`\\b${searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
				keywordFound = wordRegex.test(payloadBody.event.text);
			} else {
				keywordFound = messageText.includes(searchKeyword);
			}
	
			if (!keywordFound) {
				return [];
			}
		}
	
		return [payloadBody.event];

	},
});

type PayloadBody = {
	event: {
		text?: string;
		channel: string;
		user?: string;
		channel_type:string;
		bot_id?: string;
		thread_ts?: string;
	};
};

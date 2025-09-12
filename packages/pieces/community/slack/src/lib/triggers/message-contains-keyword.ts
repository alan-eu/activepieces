import { Property, TriggerStrategy, createTrigger } from '@activepieces/pieces-framework';
import { slackAuth } from '../../';

export const messageContainsKeywordTrigger = createTrigger({
	auth: slackAuth,
	name: 'message-contains-keyword',
	displayName: 'Message Contains Keyword',
	description: 'Triggers when a message containing a specific keyword is posted to any channel.',
	props: {
		keyword: Property.ShortText({
			displayName: 'Keyword',
			description: 'The keyword to search for in messages. Case-insensitive.',
			required: true,
		}),
		matchWholeWord: Property.Checkbox({
			displayName: 'Match Whole Word Only',
			description: 'If enabled, only matches the keyword as a complete word (e.g. "test" won\'t match "testing")',
			required: false,
			defaultValue: false,
		}),
		ignoreBots: Property.Checkbox({
			displayName: 'Ignore Bot Messages',
			description: 'If enabled, messages from bots will be ignored',
			required: false,
			defaultValue: true,
		}),
		includeThreads: Property.Checkbox({
			displayName: 'Include Thread Messages',
			description: 'If enabled, also triggers on keyword matches in thread replies',
			required: false,
			defaultValue: true,
		}),
	},
	type: TriggerStrategy.APP_WEBHOOK,
	sampleData: {
		text: 'This is a sample message with the keyword',
		channel: 'C123',
		user: 'U456',
		channel_type: 'channel'
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
		const { keyword, matchWholeWord, ignoreBots, includeThreads } = context.propsValue;

        if (!payloadBody.event.text) {
			return [];
		}

		if (ignoreBots && payloadBody.event.bot_id) {
			return [];
		}

		if (!['channel', 'group'].includes(payloadBody.event.channel_type)) {
			if (!includeThreads || !payloadBody.event.thread_ts) {
				return [];
			}
		}

		// Check if the message contains the keyword
		const messageText = payloadBody.event.text.toLowerCase();
		const searchKeyword = keyword.toLowerCase();

		let keywordFound = false;

		if (matchWholeWord) {
			// Match whole word only 
			const wordRegex = new RegExp(`\\b${searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
			keywordFound = wordRegex.test(payloadBody.event.text);
		} else {
			// else do a simple substring match
			keywordFound = messageText.includes(searchKeyword);
		}

		if (keywordFound) {
			return [payloadBody.event];
		}

		return [];
	},
});

type PayloadBody = {
	event: {
		text: string;
		channel: string;
		user: string;
		channel_type: string;
		bot_id?: string;
		thread_ts?: string;
	};
};

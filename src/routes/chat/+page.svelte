<script lang="ts">
	import { onMount } from 'svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Avatar from '$lib/components/ui/avatar/avatar.svelte';
	import AvatarFallback from '$lib/components/ui/avatar/avatar-fallback.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import ScrollTextIcon from '@lucide/svelte/icons/scroll-text';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
	import { Chat } from '@ai-sdk/svelte';
	import { chatStore, type ModerationResult } from '$lib/stores';
	import { userStore } from '$lib/stores';
	import { useAnalytics } from '$lib/composables/useAnalytics.svelte';
	import { toast } from 'svelte-sonner';
	import SEOMeta from '$lib/components/seo-meta.svelte';

	let input = $state('');
	let chat = $state<Chat | null>(null);
	let messagesEndRef = $state<HTMLDivElement | null>(null);

	const analytics = useAnalytics();

	// Call moderation API
	async function moderateMessage(messageId: string, text: string, from: 'user' | 'ai') {
		const sessionId = chatStore.currentSession?.id;
		if (!sessionId) return;

		// Set pending state
		chatStore.setPendingModeration(messageId);

		// Truncate very long texts to avoid excessive API costs and latency
		// OpenAI moderation can handle ~32k tokens, but we'll limit to ~2000 chars (reasonable for moderation)
		// Harmful content is typically detectable in the first portion of the message
		const MAX_MODERATION_LENGTH = 2000;
		const textToModerate =
			text.length > MAX_MODERATION_LENGTH ? text.slice(0, MAX_MODERATION_LENGTH) : text;

		console.log(`🚀 [${from.toUpperCase()}] Moderating message:`, {
			messageId,
			originalLength: text.length,
			moderatingLength: textToModerate.length,
			truncated: text.length > MAX_MODERATION_LENGTH,
			preview: textToModerate.slice(0, 100) + (textToModerate.length > 100 ? '...' : '')
		});

		try {
			const response = await fetch('/api/moderation', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					sessionId,
					messageId,
					from,
					text: textToModerate,
					wallet: userStore.currentWalletAddress || undefined,
					policyVersion: 'v1'
				})
			});

			const result: ModerationResult = await response.json();

			console.log(`✅ [${from.toUpperCase()}] Moderation complete:`, {
				messageId,
				result
			});

			chatStore.setModerationResult(messageId, result);

			// If blocked, show toast
			if (result.action === 'block' && !result.allowed) {
				toast.error(`Message blocked: ${result.category}`, {
					description: `Severity level ${result.severity}`
				});
			}
		} catch (error) {
			console.error(`❌ [${from.toUpperCase()}] Moderation error:`, error);
			// Set as allowed on error to not block conversation
			chatStore.setModerationResult(messageId, {
				allowed: true,
				action: 'allow',
				reason: 'moderation_error'
			});
		}
	}

	onMount(() => {
		chat = new Chat({
			onFinish: ({ message }) => {
				// Called when AI message streaming completes
				// Now we can moderate the complete response
				const completeMessage = chatStore.fromUIMessage(message);

				if (completeMessage.content && completeMessage.content.trim().length > 0) {
					// Find or add the message to store
					const existingIndex = chatStore.currentMessages.findIndex(
						(m) => m.role === 'assistant' && m.content === completeMessage.content
					);

					let messageToModerate;
					if (existingIndex === -1) {
						// Message not in store yet, add it
						messageToModerate = chatStore.addMessage('assistant', completeMessage.content);
					} else {
						// Message already in store, get its ID
						messageToModerate = chatStore.currentMessages[existingIndex];
					}

					// Moderate the complete AI response
					if (messageToModerate.id) {
						moderateMessage(messageToModerate.id, completeMessage.content, 'ai');
					}
				}
			}
		});

		// Load existing session if available
		if (chatStore.currentSession) {
			const uiMessages = chatStore.toUIMessages(chatStore.currentMessages);
			chat.messages = uiMessages;
		}

		// Watch for user messages only (immediate moderation)
		let lastProcessedIndex = 0;
		$effect(() => {
			if (chat && chat.messages.length > lastProcessedIndex) {
				// Process new messages
				for (let i = lastProcessedIndex; i < chat.messages.length; i++) {
					const message = chat.messages[i];

					// Only process user messages here (AI messages handled by onFinish)
					if (message.role === 'user') {
						const existingMessage = chatStore.currentMessages[i];

						// Only add if it's a new message
						if (!existingMessage || existingMessage.timestamp !== Date.now()) {
							const newMessage = chatStore.fromUIMessage(message);

							// Only add and moderate if there's actual content
							if (newMessage.content && newMessage.content.trim().length > 0) {
								const addedMessage = chatStore.addMessage(newMessage.role, newMessage.content);

								// Moderate user message immediately
								if (addedMessage.id) {
									moderateMessage(addedMessage.id, addedMessage.content, 'user');
								}
							}
						}
					}
				}
				lastProcessedIndex = chat.messages.length;
			}
		});

		// Auto-scroll to bottom when messages change
		$effect(() => {
			if (messagesEndRef && chat?.messages) {
				messagesEndRef.scrollIntoView({ behavior: 'smooth' });
			}
		});
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (input.trim() && chat && !chatStore.isBlocked) {
			// Create a new session if none exists
			if (!chatStore.currentSession) {
				chatStore.createSession();
				analytics.trackChatSessionCreated();
			}

			chat.sendMessage({ text: input });
			analytics.trackChatMessage();
			input = '';
		}
	}

	function handleNewChat() {
		if (chat) {
			chat.messages = [];
		}
		chatStore.createSession();
		analytics.trackChatSessionCreated();
		toast.success('New conversation started');
	}

	function handleLoadSession(sessionId: string) {
		chatStore.loadSession(sessionId);
		if (chat && chatStore.currentSession) {
			chat.messages = chatStore.toUIMessages(chatStore.currentMessages);
			toast.success('Session loaded');
		}
	}

	function handleDeleteSession(sessionId: string, event: Event) {
		event.stopPropagation();
		chatStore.deleteSession(sessionId);
		if (chat && chatStore.currentSession) {
			chat.messages = chatStore.toUIMessages(chatStore.currentMessages);
		}
		toast.success('Session deleted');
	}

	function getInitials(role: string) {
		return role === 'user' ? 'U' : 'AI';
	}

	function getAvatarColor(role: string) {
		return role === 'user' ? 'bg-blue-500' : 'bg-green-500';
	}

	function formatSessionDate(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		} else if (days === 1) {
			return 'Yesterday';
		} else if (days < 7) {
			return `${days} days ago`;
		} else {
			return date.toLocaleDateString();
		}
	}

	// Extract text content from UI message
	function getMessageText(uiMessage: any): string {
		return (
			uiMessage.parts
				?.filter((part: any) => part.type === 'text')
				.map((part: any) => part.text)
				.join('') || ''
		);
	}

	// Get moderation result for a message
	function getModerationBadge(uiMessage: any) {
		// Find the corresponding message in store by matching content and role
		const storeMessage = chatStore.currentMessages.find(
			(m) => m.role === uiMessage.role && m.content === getMessageText(uiMessage)
		);

		if (!storeMessage?.id) return null;

		const result = chatStore.getModerationResult(storeMessage.id);
		if (!result) return null;

		if (result.pending) {
			return {
				text: '⏳ Checking...',
				variant: 'secondary' as const,
				class: 'text-xs opacity-60'
			};
		}

		const severity = result.severity ?? 0;

		if (severity === 0) {
			return {
				text: '✓ Clean',
				variant: 'secondary' as const,
				class: 'text-xs text-green-600 dark:text-green-400'
			};
		}

		if (severity === 1) {
			return {
				text: `⚠️ Low risk: ${result.category}`,
				variant: 'secondary' as const,
				class: 'text-xs text-yellow-600 dark:text-yellow-400'
			};
		}

		if (severity === 2) {
			return {
				text: `⚠️ Blocked: ${result.category}`,
				variant: 'destructive' as const,
				class: 'text-xs text-orange-600 dark:text-orange-400'
			};
		}

		if (severity === 3) {
			return {
				text: `🚫 Blocked: ${result.category}`,
				variant: 'destructive' as const,
				class: 'text-xs text-red-600 dark:text-red-400'
			};
		}

		return null;
	}
</script>

<!-- Custom SEO for Chat Page -->
<SEOMeta
	seo={{
		title: 'Secure Chat Interface',
		description:
			'Real-time AI-powered chat with blockchain verification. Experience safe, monitored conversations with instant content moderation and immutable incident recording.',
		keywords: [
			'secure chat',
			'AI moderation',
			'real-time safety',
			'blockchain chat',
			'monitored conversations'
		]
	}}
/>

<main class="mx-auto flex h-full w-full max-w-4xl flex-col p-4">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Avatar class="size-10">
				<AvatarFallback class="bg-primary text-primary-foreground">AI</AvatarFallback>
			</Avatar>
			<div>
				<h1 class="text-xl font-semibold">
					{chatStore.currentSession?.title || 'Chat Assistant'}
				</h1>
				<p class="text-sm text-muted-foreground">Ask me anything</p>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="secondary" class="text-xs">
				{chat?.messages.length || 0} messages
			</Badge>
			{#if chatStore.isBlocked}
				<Badge variant="destructive" class="flex items-center gap-1 text-xs">
					<ShieldAlertIcon class="h-3 w-3" />
					Blocked
				</Badge>
			{/if}
			<Button variant="outline" size="sm" onclick={handleNewChat}>
				<PlusIcon class="mr-1 h-4 w-4" />
				New
			</Button>
			<Sheet.Root>
				<Sheet.Trigger>
					<Button variant="outline" size="sm">
						<ScrollTextIcon class="mr-1 h-4 w-4" />
						History ({chatStore.sessionCount})
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="right">
					<Sheet.Header>
						<Sheet.Title>Chat History</Sheet.Title>
						<Sheet.Description>Your previous conversations</Sheet.Description>
					</Sheet.Header>
					<div class="mt-6 space-y-2">
						{#if chatStore.sessions.length === 0}
							<div class="py-8 text-center text-sm text-muted-foreground">No previous sessions</div>
						{:else}
							{#each chatStore.sessions as session}
								<button
									class="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent {chatStore
										.currentSession?.id === session.id
										? 'bg-accent'
										: ''}"
									onclick={() => handleLoadSession(session.id)}
								>
									<div class="min-w-0 flex-1">
										<div class="flex items-center gap-2">
											<p class="truncate text-sm font-medium">{session.title}</p>
											{#if session.isBlocked}
												<Badge variant="destructive" class="shrink-0 text-xs">Blocked</Badge>
											{/if}
										</div>
										<p class="text-xs text-muted-foreground">
											{session.messageCount} messages • {formatSessionDate(session.updatedAt)}
										</p>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onclick={(e) => handleDeleteSession(session.id, e)}
									>
										<Trash2Icon class="h-4 w-4 text-destructive" />
									</Button>
								</button>
							{/each}
						{/if}
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>

	<Separator class="mb-6" />

	<!-- Blocked Alert -->
	{#if chatStore.isBlocked}
		<Alert.Root variant="destructive" class="mb-4">
			<ShieldAlertIcon class="h-4 w-4" />
			<Alert.Title>Conversation Blocked</Alert.Title>
			<Alert.Description>
				This conversation has been blocked due to a policy violation. Please start a new
				conversation to continue.
			</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Messages Area -->
	<div class="mb-6 flex-1 space-y-4 overflow-y-auto">
		{#if !chat || chat.messages.length === 0}
			<div class="flex h-full flex-col items-center justify-center text-center">
				<Avatar class="mb-4 size-16">
					<AvatarFallback class="bg-muted text-2xl">💬</AvatarFallback>
				</Avatar>
				<h2 class="mb-2 text-lg font-medium">Start a conversation</h2>
				<p class="max-w-md text-muted-foreground">
					Send a message to begin chatting with your AI assistant.
				</p>
			</div>
		{:else}
			{#each chat?.messages || [] as message, messageIndex (messageIndex)}
				<div class="flex gap-3 {message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}">
					<Avatar class="size-8 shrink-0">
						<AvatarFallback class={getAvatarColor(message.role)}>
							{getInitials(message.role)}
						</AvatarFallback>
					</Avatar>
					<div
						class="flex max-w-[80%] flex-col gap-1 {message.role === 'user'
							? 'items-end'
							: 'items-start'}"
					>
						<div class="flex items-center gap-2">
							<Badge variant="outline" class="text-xs">
								{message.role === 'user' ? 'You' : 'Assistant'}
							</Badge>
						</div>
						<Card
							class="p-4 {message.role === 'user'
								? 'bg-primary text-primary-foreground'
								: 'bg-muted'}"
						>
							{#each message.parts as part, partIndex (partIndex)}
								{#if part.type === 'text'}
									<div class="text-sm leading-relaxed whitespace-pre-wrap">
										{part.text}
									</div>
								{/if}
							{/each}
						</Card>
						<!-- Moderation Badge -->
						{#each [getModerationBadge(message)] as moderationBadge}
							{#if moderationBadge}
								<Badge variant={moderationBadge.variant} class={moderationBadge.class}>
									{moderationBadge.text}
								</Badge>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
			<div bind:this={messagesEndRef}></div>
		{/if}
	</div>

	<!-- Input Area -->
	<Card class="border-0 p-4 shadow-none">
		<form onsubmit={handleSubmit} class="flex gap-3">
			<Input
				bind:value={input}
				placeholder={chatStore.isBlocked
					? 'Conversation blocked - start a new chat'
					: 'Type your message...'}
				class="flex-1"
				disabled={chatStore.isBlocked}
			/>
			<Button type="submit" disabled={!input.trim() || chatStore.isBlocked} class="shrink-0">
				<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 2L11 13" />
					<path d="M22 2L15 22L11 13L2 9L22 2Z" />
				</svg>
			</Button>
		</form>
	</Card>
</main>

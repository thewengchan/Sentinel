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
	import ScrollTextIcon from '@lucide/svelte/icons/scroll-text';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { Chat } from '@ai-sdk/svelte';
	import { chatStore } from '$lib/stores';
	import { useAnalytics } from '$lib/composables/useAnalytics.svelte';
	import { toast } from 'svelte-sonner';

	let input = $state('');
	let chat = $state<Chat | null>(null);
	let messagesEndRef = $state<HTMLDivElement | null>(null);

	const analytics = useAnalytics();

	onMount(() => {
		chat = new Chat({});

		// Load existing session if available
		if (chatStore.currentSession) {
			const uiMessages = chatStore.toUIMessages(chatStore.currentMessages);
			chat.messages = uiMessages;
		}

		// Watch for chat messages and sync to store
		$effect(() => {
			if (chat && chat.messages.length > 0) {
				// Sync messages to store
				const lastMessage = chat.messages[chat.messages.length - 1];
				const existingCount = chatStore.currentMessages.length;

				// Only add if it's a new message
				if (chat.messages.length > existingCount) {
					const newMessage = chatStore.fromUIMessage(lastMessage);
					chatStore.addMessage(newMessage.role, newMessage.content);
				}
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
		if (input.trim() && chat) {
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
</script>

<main class="mx-auto flex h-full w-full max-w-4xl flex-col p-4 outline-2">
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
										<p class="truncate text-sm font-medium">{session.title}</p>
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
					</div>
				</div>
			{/each}
			<div bind:this={messagesEndRef}></div>
		{/if}
	</div>

	<!-- Input Area -->
	<Card class="p-4">
		<form onsubmit={handleSubmit} class="flex gap-3">
			<Input bind:value={input} placeholder="Type your message..." class="flex-1" />
			<Button type="submit" disabled={!input.trim()} class="shrink-0">
				<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 2L11 13" />
					<path d="M22 2L15 22L11 13L2 9L22 2Z" />
				</svg>
			</Button>
		</form>
	</Card>
</main>

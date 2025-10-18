<script lang="ts">
	import { onMount } from 'svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Avatar from '$lib/components/ui/avatar/avatar.svelte';
	import AvatarFallback from '$lib/components/ui/avatar/avatar-fallback.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Chat } from '@ai-sdk/svelte';

	let input = '';
	let chat: Chat | null = null;

	onMount(() => {
		chat = new Chat({});
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (input.trim() && chat) {
			chat.sendMessage({ text: input });
			input = '';
		}
	}

	function getInitials(role: string) {
		return role === 'user' ? 'U' : 'AI';
	}

	function getAvatarColor(role: string) {
		return role === 'user' ? 'bg-blue-500' : 'bg-green-500';
	}
</script>

<main class="mx-auto flex h-full w-full max-w-4xl flex-col outline-2 p-4">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Avatar class="size-10">
				<AvatarFallback class="bg-primary text-primary-foreground">AI</AvatarFallback>
			</Avatar>
			<div>
				<h1 class="text-xl font-semibold">Chat Assistant</h1>
				<p class="text-sm text-muted-foreground">Ask me anything</p>
			</div>
		</div>
		<Badge variant="secondary" class="text-xs">
			{chat?.messages.length || 0} messages
		</Badge>
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

<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';

	let input = '';
	const chat = new Chat({});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		chat.sendMessage({ text: input });
		input = '';
	}
</script>

<main>
	<ul>
		{#each chat.messages as message, messageIndex (messageIndex)}
			<li>
				<div>{message.role}</div>
				<div>
					{#each message.parts as part, partIndex (partIndex)}
						{#if part.type === 'text'}
							<div>{part.text}</div>
						{/if}
					{/each}
				</div>
			</li>
		{/each}
	</ul>
	<form onsubmit={handleSubmit}>
		<input bind:value={input} />
		<button type="submit">Send</button>
	</form>
</main>

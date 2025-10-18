<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import CoinsIcon from '@lucide/svelte/icons/coins';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import ArrowDownLeftIcon from '@lucide/svelte/icons/arrow-down-left';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Wallet</h1>
			<p class="text-muted-foreground">Connect and manage your blockchain wallet</p>
		</div>
		<Button>
			<WalletIcon class="mr-2 h-4 w-4" />
			Connect Wallet
		</Button>
	</div>

	<!-- Wallet Status -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Wallet Status</Card.Title>
			<Card.Description>Your connected wallet information</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<div class="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
					<div class="space-y-1">
						<p class="text-sm font-medium text-muted-foreground">Wallet Address</p>
						<div class="flex items-center gap-2">
							<code class="font-mono text-sm">0x742d...5f8a</code>
							<Button variant="ghost" size="sm">
								<CopyIcon class="h-3 w-3" />
							</Button>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<div class="h-2 w-2 animate-pulse rounded-full bg-green-600"></div>
						<span class="text-sm font-medium">Connected</span>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Balance Overview -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Balance</Card.Title>
				<CoinsIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">5.234 ETH</div>
				<p class="text-xs text-muted-foreground">≈ $10,847.32 USD</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Gas Balance</Card.Title>
				<CoinsIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">0.15 ETH</div>
				<p class="text-xs text-muted-foreground">Reserved for gas fees</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Token Balance</Card.Title>
				<CoinsIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">1,000 SEN</div>
				<p class="text-xs text-muted-foreground">Sentinel Tokens</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Recent Transactions -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title>Recent Transactions</Card.Title>
					<Card.Description>Your latest wallet activity</Card.Description>
				</div>
				<Button variant="outline" size="sm">
					<RefreshCwIcon class="h-4 w-4" />
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<div class="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
							<ArrowDownLeftIcon class="h-5 w-5 text-green-600" />
						</div>
						<div>
							<p class="text-sm font-medium">Received ETH</p>
							<p class="text-xs text-muted-foreground">From: 0x1234...abcd</p>
						</div>
					</div>
					<div class="text-right">
						<p class="font-semibold text-green-600">+0.5 ETH</p>
						<p class="text-xs text-muted-foreground">2 hours ago</p>
					</div>
				</div>

				<div class="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
							<ArrowUpRightIcon class="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<p class="text-sm font-medium">Log Storage Fee</p>
							<p class="text-xs text-muted-foreground">Contract: Sentinel Monitor</p>
						</div>
					</div>
					<div class="text-right">
						<p class="font-semibold text-blue-600">-0.002 ETH</p>
						<p class="text-xs text-muted-foreground">5 hours ago</p>
					</div>
				</div>

				<div class="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
							<ArrowUpRightIcon class="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<p class="text-sm font-medium">Token Purchase</p>
							<p class="text-xs text-muted-foreground">Bought: 1000 SEN</p>
						</div>
					</div>
					<div class="text-right">
						<p class="font-semibold text-blue-600">-0.1 ETH</p>
						<p class="text-xs text-muted-foreground">1 day ago</p>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Quick Actions -->
	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Send</Card.Title>
				<Card.Description>Transfer tokens or ETH</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-2">
					<Label for="recipient">Recipient Address</Label>
					<Input id="recipient" type="text" placeholder="0x..." />
				</div>
				<div class="space-y-2">
					<Label for="amount">Amount</Label>
					<Input id="amount" type="text" placeholder="0.0" />
				</div>
				<Dialog.Root>
					<Dialog.Trigger class="w-full">
						<Button class="w-full">
							<ArrowUpRightIcon class="mr-2 h-4 w-4" />
							Send Transaction
						</Button>
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Confirm Transaction</Dialog.Title>
							<Dialog.Description>
								Review your transaction details before confirming.
							</Dialog.Description>
						</Dialog.Header>
						<div class="space-y-4 py-4">
							<div class="space-y-3 rounded-lg border p-4">
								<div class="flex items-center justify-between">
									<span class="text-sm text-muted-foreground">From</span>
									<code class="text-sm font-medium">0x742d...5f8a</code>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-sm text-muted-foreground">To</span>
									<code class="text-sm font-medium">0x1234...abcd</code>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-sm text-muted-foreground">Amount</span>
									<span class="text-sm font-medium">0.5 ETH</span>
								</div>
								<div class="flex items-center justify-between border-t pt-3">
									<span class="text-sm text-muted-foreground">Estimated Gas</span>
									<span class="text-sm font-medium">0.002 ETH</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-sm font-semibold">Total</span>
									<span class="text-sm font-semibold">0.502 ETH</span>
								</div>
							</div>
							<div class="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
								<CheckCircle2Icon class="h-5 w-5 text-blue-600" />
								<div class="space-y-1">
									<p class="text-sm font-medium text-blue-900">Transaction Details</p>
									<p class="text-sm text-blue-700">
										This transaction will be logged on the blockchain and cannot be reversed. Make
										sure you've verified the recipient address.
									</p>
								</div>
							</div>
						</div>
						<Dialog.Footer>
							<Button variant="outline" onclick={() => {}}>Cancel</Button>
							<Button onclick={() => {}}>Confirm & Send</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Network Info</Card.Title>
				<Card.Description>Current blockchain network status</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground">Network</span>
					<span class="text-sm font-medium">Ethereum Mainnet</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground">Gas Price</span>
					<span class="text-sm font-medium">25 Gwei</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground">Block Number</span>
					<span class="text-sm font-medium">18,234,567</span>
				</div>
				<Button variant="outline" class="mt-4 w-full">
					<ExternalLinkIcon class="mr-2 h-4 w-4" />
					View on Explorer
				</Button>
			</Card.Content>
		</Card.Root>
	</div>
</div>

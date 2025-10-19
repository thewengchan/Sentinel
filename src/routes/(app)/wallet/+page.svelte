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
	import { browser } from '$app/environment';

	import { useWallet, type Wallet } from '@txnlab/use-wallet-svelte';
	import { onMount } from 'svelte';
	import { walletStore, blockchainStore } from '$lib/stores';
	import { useAnalytics } from '$lib/composables/useAnalytics.svelte';
	import { toast } from 'svelte-sonner';

	// Only initialize wallet on client side to prevent hydration mismatch
	let wallets: Wallet[] = $state([]);
	let activeWalletData: Wallet | null = $state(null);
	let connecting = $state(false);

	const analytics = useAnalytics();

	// Initialize wallet state on client side only
	onMount(() => {
		const { wallets: walletList, activeWallet } = useWallet();
		wallets = walletList;
		// Use a reactive statement instead of $derived in conditional
		$effect(() => {
			activeWalletData = activeWallet() || null;
		});
	});

	const handleConnect = async (wallet: Wallet) => {
		connecting = true;
		try {
			await wallet.connect();
			toast.success('Wallet connected successfully');
		} catch (error) {
			console.error('Failed to connect:', error);
			toast.error('Failed to connect wallet');
			analytics.trackError(error as Error, { action: 'wallet_connect' });
		} finally {
			connecting = false;
		}
	};

	const setActiveAccount = (event: Event, wallet: Wallet) => {
		const selectElement = event.target as HTMLSelectElement;
		wallet.setActiveAccount(selectElement.value);
	};

	const handleRefresh = async () => {
		const address = walletStore.activeAddress;
		if (address) {
			await blockchainStore.refresh(address);
			toast.success('Data refreshed');
		}
	};

	const handleCopyAddress = () => {
		const address = walletStore.activeAddress;
		if (address) {
			navigator.clipboard.writeText(address);
			toast.success('Address copied to clipboard');
			analytics.trackFeature('copy_address');
		}
	};

	// Format transaction date
	function formatDate(timestamp: number): string {
		const now = Date.now() / 1000;
		const diff = now - timestamp;

		if (diff < 3600) {
			const minutes = Math.floor(diff / 60);
			return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
		} else if (diff < 86400) {
			const hours = Math.floor(diff / 3600);
			return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
		} else {
			const days = Math.floor(diff / 86400);
			return `${days} day${days !== 1 ? 's' : ''} ago`;
		}
	}

	// Format transaction type
	function formatTxType(type: string): string {
		switch (type) {
			case 'pay':
				return 'Payment';
			case 'axfer':
				return 'Asset Transfer';
			case 'acfg':
				return 'Asset Config';
			case 'afrz':
				return 'Asset Freeze';
			case 'keyreg':
				return 'Key Registration';
			case 'appl':
				return 'App Call';
			default:
				return type;
		}
	}
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Wallet</h1>
			<p class="text-muted-foreground">Connect and manage your blockchain wallet</p>
		</div>
	</div>

	<!-- Wallet Status -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Wallet Status</Card.Title>
			<Card.Description>Your connected wallet information</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if browser}
				{#if activeWalletData}
					<div class="space-y-4">
						<!-- Wallet Info -->
						<div class="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
							<div class="flex items-center gap-3">
								<img
									src={activeWalletData.metadata.icon}
									alt={activeWalletData.metadata.name}
									width="32"
									height="32"
									class="rounded"
								/>
								<div class="space-y-1">
									<p class="text-sm font-medium">{activeWalletData.metadata.name}</p>
									{#if activeWalletData.accounts?.current?.[0]}
										<div class="flex items-center gap-2">
											<code class="font-mono text-xs">
												{blockchainStore.formatAddress(walletStore.activeAddress || '')}
											</code>
											<Button variant="ghost" size="sm" onclick={handleCopyAddress}>
												<CopyIcon class="h-3 w-3" />
											</Button>
										</div>
									{/if}
								</div>
							</div>
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 animate-pulse rounded-full bg-green-600"></div>
								<span class="text-sm font-medium">Connected</span>
							</div>
						</div>

						<!-- Account Selection -->
						{#if activeWalletData.accounts?.current && activeWalletData.accounts.current.length > 1}
							<div class="space-y-2">
								<Label for="account-select">Select Account</Label>
								<select
									id="account-select"
									class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
									value={activeWalletData?.accounts?.current?.[0]?.address}
									onchange={(event) =>
										activeWalletData && setActiveAccount(event, activeWalletData)}
								>
									{#each activeWalletData.accounts.current as account}
										<option value={account.address}>
											{account.name} ({account.address.slice(0, 6)}...{account.address.slice(-4)})
										</option>
									{/each}
								</select>
							</div>
						{/if}

						<!-- Disconnect Button -->
						<Button variant="outline" onclick={() => activeWalletData?.disconnect()} class="w-full">
							Disconnect Wallet
						</Button>
					</div>
				{:else}
					<div class="space-y-4">
						<div class="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
							<div class="space-y-1">
								<p class="text-sm font-medium text-muted-foreground">No wallet connected</p>
								<p class="text-xs text-muted-foreground">
									Connect a wallet to view your information
								</p>
							</div>
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 rounded-full bg-gray-400"></div>
								<span class="text-sm font-medium text-muted-foreground">Disconnected</span>
							</div>
						</div>
					</div>
				{/if}
			{:else}
				<!-- Server-side fallback -->
				<div class="space-y-4">
					<div class="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
						<div class="space-y-1">
							<p class="text-sm font-medium text-muted-foreground">Loading wallet...</p>
							<p class="text-xs text-muted-foreground">Initializing wallet connection</p>
						</div>
						<div class="flex items-center gap-2">
							<div class="h-2 w-2 rounded-full bg-gray-400"></div>
							<span class="text-sm font-medium text-muted-foreground">Loading</span>
						</div>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Only show wallet information when connected -->
	{#if browser && activeWalletData}
		<!-- Balance Overview -->
		<div class="grid gap-4 md:grid-cols-3">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">ALGO Balance</Card.Title>
					<CoinsIcon class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					{#if blockchainStore.isLoading && !blockchainStore.balance}
						<div class="text-2xl font-bold">Loading...</div>
						<p class="text-xs text-muted-foreground">Fetching balance</p>
					{:else if blockchainStore.balance}
						<div class="text-2xl font-bold">{blockchainStore.algoBalance.toFixed(4)} ALGO</div>
						<p class="text-xs text-muted-foreground">Algorand native token</p>
					{:else}
						<div class="text-2xl font-bold">0.0000 ALGO</div>
						<p class="text-xs text-muted-foreground">No balance data</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Assets</Card.Title>
					<CoinsIcon class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{blockchainStore.assets.length}</div>
					<p class="text-xs text-muted-foreground">
						Asset{blockchainStore.assets.length !== 1 ? 's' : ''} held
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Transactions</Card.Title>
					<CoinsIcon class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{blockchainStore.transactions.length}</div>
					<p class="text-xs text-muted-foreground">Recent transactions</p>
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
					<Button
						variant="outline"
						size="sm"
						onclick={handleRefresh}
						disabled={blockchainStore.isLoading}
					>
						<RefreshCwIcon class="h-4 w-4 {blockchainStore.isLoading ? 'animate-spin' : ''}" />
					</Button>
				</div>
			</Card.Header>
			<Card.Content>
				{#if blockchainStore.isLoading && blockchainStore.transactions.length === 0}
					<div class="space-y-4">
						<div class="py-8 text-center text-sm text-muted-foreground">
							Loading transactions...
						</div>
					</div>
				{:else if blockchainStore.transactions.length === 0}
					<div class="space-y-4">
						<div class="py-8 text-center text-sm text-muted-foreground">No transactions found</div>
					</div>
				{:else}
					<div class="space-y-4">
						{#each blockchainStore.transactions.slice(0, 5) as tx}
							{@const isReceived = tx.receiver === walletStore.activeAddress}
							<div
								class="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50"
							>
								<div class="flex items-center gap-3">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-full {isReceived
											? 'bg-green-100'
											: 'bg-blue-100'}"
									>
										{#if isReceived}
											<ArrowDownLeftIcon class="h-5 w-5 text-green-600" />
										{:else}
											<ArrowUpRightIcon class="h-5 w-5 text-blue-600" />
										{/if}
									</div>
									<div>
										<p class="text-sm font-medium">{formatTxType(tx.type)}</p>
										<p class="text-xs text-muted-foreground">
											{isReceived ? 'From' : 'To'}: {blockchainStore.formatAddress(
												isReceived ? tx.sender : tx.receiver || 'N/A'
											)}
										</p>
									</div>
								</div>
								<div class="text-right">
									<p class="font-semibold {isReceived ? 'text-green-600' : 'text-blue-600'}">
										{isReceived ? '+' : '-'}{(tx.amount / 1_000_000).toFixed(4)} ALGO
									</p>
									<p class="text-xs text-muted-foreground">{formatDate(tx.roundTime)}</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
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
										<code class="text-sm font-medium">
											{activeWalletData?.accounts?.current?.[0]?.address
												? `${activeWalletData.accounts.current[0].address.slice(0, 6)}...${activeWalletData.accounts.current[0].address.slice(-4)}`
												: '0x742d...5f8a'}
										</code>
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
								<div
									class="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4"
								>
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
						<span class="text-sm font-medium capitalize"
							>{blockchainStore.network || 'Testnet'}</span
						>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Last Round</span>
						<span class="text-sm font-medium"
							>{blockchainStore.networkInfo?.lastRound?.toLocaleString() || 'N/A'}</span
						>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Last Updated</span>
						<span class="text-sm font-medium">
							{blockchainStore.lastUpdated
								? formatDate(Math.floor(blockchainStore.lastUpdated / 1000))
								: 'Never'}
						</span>
					</div>
					<Button
						variant="outline"
						class="mt-4 w-full"
						onclick={() => {
							const network = blockchainStore.network || 'testnet';
							const address = walletStore.activeAddress;
							if (address) {
								window.open(`https://${network}.algoscan.app/address/${address}`, '_blank');
								analytics.trackFeature('view_on_explorer');
							}
						}}
					>
						<ExternalLinkIcon class="mr-2 h-4 w-4" />
						View on Explorer
					</Button>
				</Card.Content>
			</Card.Root>
		</div>
	{:else if browser}
		<!-- Show connection prompt when no wallet is connected -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Connect Your Wallet</Card.Title>
				<Card.Description
					>Connect a wallet to view your balance, transactions, and manage your assets</Card.Description
				>
			</Card.Header>
			<Card.Content class="space-y-6">
				<div class="space-y-4 text-center">
					<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
						<WalletIcon class="h-8 w-8 text-muted-foreground" />
					</div>
					<div class="space-y-2">
						<h3 class="text-lg font-semibold">No Wallet Connected</h3>
						<p class="text-sm text-muted-foreground">
							Connect your wallet to access your balance, view transaction history, and send
							transactions.
						</p>
					</div>
				</div>

				{#if wallets.length > 0}
					<div class="space-y-3">
						<Label>Available Wallets</Label>
						<div class="grid gap-2">
							{#each wallets as wallet}
								<Button
									variant="outline"
									onclick={() => handleConnect(wallet)}
									disabled={connecting}
									class="h-12 justify-start"
								>
									<img
										src={wallet.metadata.icon}
										alt={wallet.metadata.name}
										width="24"
										height="24"
										class="mr-3"
									/>
									<span class="font-medium">{wallet.metadata.name}</span>
								</Button>
							{/each}
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>

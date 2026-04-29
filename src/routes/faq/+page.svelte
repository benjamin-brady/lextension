<svelte:head>
	<title>FAQ — Lextension</title>
	<meta name="description" content="Frequently asked questions about Lextension, the word bridge puzzle game." />
</svelte:head>

<div class="grid gap-8">
	<h1 class="font-display text-2xl font-black tracking-tight">FAQ</h1>

	<section class="grid gap-6">
		<div class="grid gap-2">
			<h2 class="font-display text-lg font-bold">What is Lextension?</h2>
			<p class="text-sm text-(--text-muted) leading-relaxed">
				Lextension is a word bridge puzzle. You're given a start word and a target word, and you need to build a chain of words connecting them. Each word you add must have a valid relationship to the previous word. Fewer hops means a higher score.
			</p>
		</div>

		<div class="grid gap-2">
			<h2 class="font-display text-lg font-bold">What counts as a valid link?</h2>
			<p class="text-sm text-(--text-muted) leading-relaxed">
				Two words are linked if they share a recognizable relationship. That includes compound words (hot + dog), synonyms, opposites, rhymes, anagrams, homophones, category siblings (cat + dog), part-whole (wheel + car), and more. If you can explain the connection, there's a good chance it'll count.
			</p>
		</div>

		<div class="grid gap-2">
			<h2 class="font-display text-lg font-bold">How does validation work?</h2>
			<p class="text-sm text-(--text-muted) leading-relaxed">
				Some link types are checked instantly in your browser: anagrams are detected by comparing sorted letters, and rhymes are matched using the CMU Pronouncing Dictionary (a phonetic dictionary used in speech research). Everything else is validated by an AI model. Results are cached, so the same word pair won't need to be checked twice.
			</p>
		</div>

		<div class="grid gap-2">
			<h2 class="font-display text-lg font-bold">Rhyming feels strict. Why doesn't X rhyme with Y?</h2>
			<p class="text-sm text-(--text-muted) leading-relaxed">
				Rhyme detection uses syllabic rhyming based on the CMU Pronouncing Dictionary. Two words rhyme if they share the same stressed vowel sound and everything after it. This is stricter than "sounds kinda similar" — it requires a proper phonetic match. There's also a small set of spelling-pattern fallbacks (like -ight/-ite) for words not in the dictionary. If a rhyme doesn't register, the AI validator may still catch it as a different link type.
			</p>
		</div>

		<div class="grid gap-2">
			<h2 class="font-display text-lg font-bold">What are the game modes?</h2>
			<div class="text-sm text-(--text-muted) leading-relaxed grid gap-2">
				<p>
					<strong class="text-(--text)">Daily Chain</strong> — a new start/end pair every day (rolls over at midnight your local time). Build the shortest chain you can.
				</p>
				<p>
					<strong class="text-(--text)">Daily Fib</strong> — like Chain, but Fibonacci-style: each word you add must link to <em>both</em> of the two words before it, not just the last one.
				</p>
				<p>
					<strong class="text-(--text)">Practice</strong> — random word pairs (Chain or Fib) for when you want to keep playing.
				</p>
			</div>
		</div>

		<div class="grid gap-2">
			<h2 class="font-display text-lg font-bold">How is scoring calculated?</h2>
			<p class="text-sm text-(--text-muted) leading-relaxed">
				Your score is 1000 divided by the number of hops (words you added between start and end). One hop is a Genius score. Two is Brilliant. Four or fewer is Solid. The fewer words you need, the better.
			</p>
		</div>

		<div class="grid gap-2">
			<h2 class="font-display text-lg font-bold">Who made this?</h2>
			<p class="text-sm text-(--text-muted) leading-relaxed">
				Lextension is made by <a class="text-(--text) underline hover:text-(--accent) transition-colors" href="https://www.linkedin.com/in/benj-brady/" target="_blank" rel="noopener noreferrer">Ben Brady</a>.
			</p>
		</div>

		<div class="grid gap-2">
			<h2 class="font-display text-lg font-bold">I found a bug / have feedback</h2>
			<p class="text-sm text-(--text-muted) leading-relaxed">
				Join the <a class="text-(--text) underline hover:text-(--accent) transition-colors" href="https://discord.gg/AWfvmFWBcA" target="_blank" rel="noopener noreferrer">Discord</a> — that's the best place to report issues or suggest improvements.
			</p>
		</div>
	</section>

	<a href="/" class="text-sm text-(--text-muted) hover:text-(--accent) transition-colors">&larr; Back to game</a>
</div>

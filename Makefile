grammar/grammar.js: grammar/grammar.pegjs
	pegjs --format globals --export-var parser -o $@ $<

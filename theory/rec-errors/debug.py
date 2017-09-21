"""Simple CLI for correcting commands on the fly."""
from corrections import correct, gen_commands, phon_seq, levenshtein_table, BLOCK_TYPES, VALUE_SETS

def main():
    """Main for CLI."""
    block_ids = [str(i) for i in range(1, input('How many block IDs you want, yo? ') + 1)]

    print 'Alright homie, generating them commands...'
    commands = gen_commands(block_ids, BLOCK_TYPES, VALUE_SETS)

    print_all = raw_input('Done! Should I print these bad boys? (y/n) ')
    if print_all == 'y':
        print 'Alright, you asked for it! Generated commands are:'
        for command in commands:
            print command, '(', phon_seq(command), ')'
    elif print_all == 'n':
        print 'Okay, not printing commands.'
    else:
        print 'I said (y/n). Can you read? Anyway, not printing...'

    next_command = lambda: raw_input('\nGive me an utterance to correct or "quit" to exit: ')
    next_table = lambda: raw_input(
        '\nWould you like to see the levenshtein table for another command? (enter command or "no"): ')
    command = next_command()
    while command.lower() != 'quit':
        correction = correct(command, commands)
        print ('Command \033[94m "%s" \033[0m was corrected to \033[94m "%s" \033[0m'
               % (command.upper(), correction.upper()))
        print 'In phonemes: %s was corrected to %s' % (phon_seq(command), phon_seq(correction))
        print 'Winning Levenshtein table was:'
        print levenshtein_table(command, correction)

        other_command = next_table()
        while other_command.lower() != 'no':
            print levenshtein_table(command, other_command)
            other_command = next_table()

        command = next_command()
    print 'Bye!'

if __name__ == '__main__':
    main()

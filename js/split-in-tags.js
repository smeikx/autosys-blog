'use strict';

/* This scans a string for inline tags (<em>, </bold>, …).
It returns an array of indexes of all angle brackets in order of appearence;
it starts with the index of the first ‘<’, followed by the index of the accompanying ‘>’:
	[first_<, first_>, second_<, second_>, third_< … ]
XXX It cannot deal with inline ‘<’ and ‘>’, like ‘<i> >_< </i>’.
XXX Maybe use some kind of preprocessor to substitute with HTML entities?
*/
const get_tag_indexes = (string) =>
{
	const indexes = [];
	let opening = 0, closing = 0;
	do {
		opening = string.indexOf('<', closing);
		// return when no more tags can be found
		if (opening < 0) return indexes;
		closing = string.indexOf('>', opening);
		indexes.push(opening, closing);
	} while (true);
};

/* This takes a string and wraps all non-whitespace in a given tag.
'Hi … world?' → '<x>Hi</x> <x>…</x> <x>world?</x>'
It also takes an array of indexes, as returned by ‘get_tag_indexes’;
this allows skipping tags while wrapping (but not their content).
*/
const wrap_words_in_tag = (string, tag_name, skip_indexes) =>
{
	const
		pattern = /\S+/g,
		replacement = `<${tag_name} class='word'>$&</${tag_name}>`,
		length = skip_indexes ? skip_indexes.length : 0;

	let
		result = '',
		i = 0, // current position in skip_indexes
		start = 0,
		next,
		end;

	// works around substrings from ‘skip_indexes’
	while (i < length)
	{
		end = skip_indexes[i++];
		next = skip_indexes[i++];

		result = result.concat(
			string.substring(start, end).replaceAll(pattern, replacement), // innerText
			string.substring(end, next + 1) // the inline tag itself
		);
		start = next + 1;
	}
	// wraps everything that is left …
	// or the whole string if no ‘skip_indexes’ had been provided
	result += string.substring(start).replaceAll(pattern, replacement);
	return result;
};

for (const e of document.getElementsByTagName('p'))
{
	const inner_html = e.innerHTML;
	e.innerHTML = wrap_words_in_tag(inner_html, 'span', get_tag_indexes(inner_html));
}

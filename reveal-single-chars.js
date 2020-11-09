'use strict';

/*
	This script gets an alement of the id ‘text’ and wraps all its characters in span elements.
	Manually (from the browers’s console) calling ‘reveal()’ makes one letter group after the other appear.
 */

const temp_chars = []; // records all chars; is later converted to a Set

{
	const
		paragraph = document.getElementById('text'),
		text = paragraph.innerHTML,
		spans = [];

	/*
		Takes a string and wraps all characters with <span>, returns a <p>.
		- assigns the span the group name of its containing character
		- assigns the span the class ‘hidden’
		- whitespace is wrapped with the preceding character 
		- additionally takes an array to append the created <span> elements to
	*/
	const spanify = (string, list) =>
	{
		const
			result = document.createElement('p'),
			string_length = string.length;

		for (let content, next_char, i = 0; i < string_length; ++i)
		{
			content = string[i];
			next_char = i + 1;

			while (string[next_char] == ' ')
			{
				content += string[next_char];
				i = next_char++;
			}

			const span = document.createElement('span');

			const char = content[0].toLowerCase();
			span.className = `hidden ${char}`;
			temp_chars.push(char);

			span.innerHTML = content;
			spans.push();
			result.appendChild(span);
		}
		return result;
	}

	paragraph.parentNode.replaceChild(spanify(text), paragraph);
}


const reveal = async () =>
{
	const
		chars = new Set(temp_chars),
		sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms)),
		random_int = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
		reveal_class = async (class_name) =>
		{
			for (const char_element of document.getElementsByClassName(class_name))
			{
				char_element.classList.remove('hidden');
				await sleep(random_int(50, 200));
			}
		};

	for (const char of chars)
		reveal_class(char);
}

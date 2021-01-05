'use strict';

/** @fn prepare_scrolling_title
 *
 *	This clones an Element until there are enough copies to fill a specified width. A separating character is inserted between the copies. The CSS property ‘--title-width’ (necessary for the scrolling animation) is set to the title element’s width.
 *
 * @param {Element} title  The element to be cloned.
 * @param {Number} display_width  The width to be covered. (The titlebar of an article for example.)
 * @param {Number} scroll_speed  This sets a certain CSS property. The number does not correspond with a specific unit.
 */

const prepare_scrolling_title = (title, display_width, scroll_speed) =>
{
	const separator = document.createElement('span');
	separator.innerHTML = '~';
	separator.className = 'separator';
	title.appendChild(separator);

	const
		computed_style = window.getComputedStyle(title),
		width = title.getBoundingClientRect().width + parseFloat(computed_style.marginLeft) + parseFloat(computed_style.marginRight),
		parent = title.parentElement,
		parent_style = parent.style,
		clone_count = Math.ceil(display_width / width);

	parent_style.setProperty('--title-width', width + 'px');

	// Set scroll speed to titles; divide to normalise between different title lengths.
	parent_style.animationDuration = width / scroll_speed + 's';

	const
		fragment = document.createDocumentFragment(),
		title_clone = document.createElement('span');

	// XXX: If I would populate the fragment with clones and just append it to title’s parent, the browser would insert whitespace after the original title.
	fragment.appendChild(title);

	title_clone.innerHTML = title.innerHTML;
	title_clone.className = 'title-clone';
	for (let i = 0; i <= clone_count; ++i)
		fragment.appendChild(title_clone.cloneNode(true));

	parent.appendChild(fragment);
}

// Set up the scrolling titles.
{
	const
		previews = document.getElementsByClassName('preview'),
		titles = document.querySelectorAll('.preview .title'),
		has_title_font_loaded = () => document.fonts.check('1rem Minipax');

	for (let i = titles.length - 1; i >= 0; --i)
	{
		prepare_scrolling_title(
			titles[i],
			previews[i].getBoundingClientRect().width,
			random_int(80, 200));
	}

	// XXX: It seems Safari can neither update ‘@keyframes’ nor ‘animation’ properties when they contain custom properties that are being changed via JS.
	// The following horrible hack adds the affected CSS with a <style> tag and overwrites its content on resize.
	const style = document.createElement('style');
	const styling = style.innerHTML =
		`.title-container {
			animation: .1s linear 0s infinite normal none running title;
		}
		@keyframes title {
			from { transform: translateX(var(--start-position)); }
			to { transform: translateX(var(--final-position)); }
		}`;
	document.head.appendChild(style);

	let timer;
	const update_titles = () =>
	{
		// TODO: If window gets larger, add more clones.
		for (let i = titles.length - 1; i >= 0; --i)
		{
			const
				title = titles[i],
				computed_style = window.getComputedStyle(title);

			title.parentElement.style.setProperty(
				'--title-width',
				title.getBoundingClientRect().width +
				parseFloat(computed_style.marginLeft) +
				parseFloat(computed_style.marginRight) + 'px');
		}
		style.innerHTML = '';
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => style.innerHTML = styling, 50);
	}

	window.addEventListener('resize', update_titles);

	// Check for a few seconds if the font that defines the titles’ dimensions has beeen loaded.
	if (!has_title_font_loaded())
	{
		const
			interval = 50,
			timeout = 20000;
		let time = 0;
		const id = setInterval(() =>
		{
			console.log(time);
			if (has_title_font_loaded() || (time += interval) >= timeout)
			{
				update_titles();
				clearInterval(id);
			}
		}, interval);
	}
}

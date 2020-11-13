'use strict';

const
	main = document.getElementsByTagName('main')[0],
	articles = document.getElementsByTagName('article');

// Set up the scrolling titles.
{

	const titles = document.getElementsByClassName('title');
	for (let i = titles.length - 1, title, width, parent, parent_style; i >= 0; --i)
	{
		title = titles[i];

		// Insert a <span> to separate from title-clones.
		// XXX cannot contain a terminating space, because then BoundingClientRect.width is wrong!
		// XXX Whitespace is instead defined via CSS.
		title.innerHTML += '<span class="separator">~</span>';
		width = title.getBoundingClientRect().width;

		// title’s parent is of class ‘title-container’
		parent_style = (parent = title.parentElement).style;
		parent_style.setProperty('--title-width', '-' + width + 'px');
		
		// Set random scroll speed to titles; divide to normalise between different title lengths.
		parent_style.animationDuration = width / random_int(80, 200) + 's';

		// Append clones of the title to allow infinite side scrolling.
		const clone_count = Math.ceil(articles[i].getBoundingClientRect().width / width);
		title.outerHTML +=
			'<span class="title-clone">' +
			title.innerHTML.repeat(clone_count) +
			'</span>';
	}

	// This is necessary for Chromium, because it only uses the updated CSS variable when the animation is started AFTER the variable is set.
	main.style.setProperty('--animation-state', 'running');
}

{
	for (let i = articles.length - 1; i >= 0; --i)
	{
		const article = articles[i];
		article.addEventListener('click', () => article.classList.toggle('open'));
	}
}

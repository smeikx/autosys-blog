'use strict';

const main = document.getElementsByTagName('main')[0];

// Set up the scrolling titles.
{
	const titles = document.getElementsByClassName('title');
	for (let i = titles.length - 1, title, width, parent_style; i >= 0; --i)
	{
		title = titles[i];
		width = title.getBoundingClientRect().width;
		// title’s parent should be of class ‘title-container’
		parent_style = title.parentElement.style;
		parent_style.setProperty('--title-width', '-' + width + 'px');
		
		// Set random scroll speed to titles; divide to normalise between different title lengths
		parent_style.animationDuration = width / random_int(80, 200) + 's';
	}

	// This is necessary for Chromium, because it only uses the updated CSS variable when the animation is started AFTER the variable is set.
	main.style.setProperty('--animation-state', 'running');
}

{
	const articles = document.getElementsByTagName('article');
	for (let i = articles.length - 1; i >= 0; --i)
	{
		const article = articles[i];
		article.addEventListener('click', () => article.classList.toggle('open'));
	}
}

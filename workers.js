'use strict';

// simple helper functions
const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
const random_int = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


/* This returns an array of shuffled indexes from a given array.
*/
const randomise_indexes = (array) =>
{
	const length = array.length, indexes = new Array(length);
	for (let i = 0; i < length; indexes[i] = i++);
	
	for (let i = 0, j, tmp; i < length; ++i)
	{
		j = random_int(0, i);
		tmp = indexes[i];
		indexes[i] = indexes[j];
		indexes[j] = tmp;
	}
	return indexes;
}


// create constructor function
const Worker = (() =>
{
	const transform_to = (target, source) =>
	{
		const bcr = source.getBoundingClientRect();
		target.style.transform =
			`translate(${bcr.x+window.pageXOffset}px,${bcr.y+window.pageYOffset}px)`;
		target.style.width = bcr.width + 'px';
		target.style.height = bcr.height + 'px';
	}

	// move the worker to a random target
	const move_to_next = async function ()
	{
		this.current_target = this.targets[random_int(0, this.targets.length)];
		transform_to(this.element, this.current_target);
	};

	// append worker to DOM and make it move
	const start = async function ()
	{
		this.is_active = true;
		document.body.appendChild(this.element);
		do {
			this.move_to_next();
			await sleep(random_int(5000, 9000));
		} while (this.is_active);
	};

	return function (targets, current_target_index)
	{
		const element = document.createElement('div');
		element.className = 'worker';

		// properties
		this.element = element;
		this.targets = targets;
		this.current_target = targets[current_target_index];
		this.is_active = false;

		// methods
		this.move_to_next = move_to_next;
		this.start = start;
	};

})();

//await sleep(random_int(5000, 9000));

const worker = (() =>
{
	const targets = document.getElementsByClassName('x');
	return new Worker(targets, random_int(0, targets.length));
})();

worker.start();

(async () =>
{
})();

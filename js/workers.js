'use strict';

// simple helper functions
const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));


// This randomises an array in-place.
const randomise_array = (array) =>
{
	for (let i = array.length - 1, j, tmp; i >= 0; --i)
	{
		j = random_int(0, i);
		tmp = array[i];
		array[i] = array[j];
		array[j] = tmp;
	}
	return array;
};


/* This returns an array of shuffled indexes from a given array.
*/
const randomise_indexes = (array) =>
{
	const length = array.length, indexes = new Array(length);
	for (let i = 0; i < length; indexes[i] = i++);
	return randomise_array(indexes);
};


// This creates a constructor.
// TODO: maybe move some functions to Worker.prototype
const Worker = (() =>
{
	// TODO: respect margin/padding/border (subtract it from position, add it to dimensions)
	// TODO: use scale instead of changing height & width
	const transform_to = (target, source) =>
	{
		const
			source_bcr = source.getBoundingClientRect(),
			x_pos = source_bcr.x + window.pageXOffset,
			y_pos = source_bcr.y + window.pageYOffset;

		target.style.transform = `translate(${x_pos}px,${y_pos}px)`;
		target.style.width = source_bcr.width + 'px';
		target.style.height = source_bcr.height + 'px';
	}

	// A dictionary of functions that make up the behaviour of the worker;
	// the individual functions can be selected at worker creation.
	const behaviour_functions =
	{
		task:
		{
			nothing: async function ()
			{
				return sleep(random_int(3500, 10000));
			},
			jumble: async function ()
			{
				const
					original_content = this.current_target.innerText,
					length = original_content.length,
					jumbled = Array.from(original_content);

				await sleep(3000); // TODO: use event listener (transitionEnd)
				for (let i = 0; i < 5; ++i)
				{
					this.current_target.innerText = randomise_array(jumbled).join('');
					await sleep(300);
				}
				this.current_target.innerText = original_content;
				await sleep(1000);
			},
			scan: async function ()
			{
			},
			encrypt: async function ()
			{
			},
			decrypt: async function ()
			{
			},
			sort: async function ()
			{
			}
		},
		next_target_index:
		{
			in_order: function ()
			{
				return this.current_target_index = this.current_target_index % (this.targets.length - 1);
			},
			random: function ()
			{
				return this.current_target_index = random_int(0, this.targets.length - 1);
			}
		}
	};


	// Keeps track of Elements that are currently being worked on.
	const occupied = new Set();


	const move_to_next_target = async function ()
	{
		// make sure not to assign to an element twice
		let new_target;
		do {
			new_target = this.targets[this.next_target_index()];
		} while (occupied.has(new_target));

		occupied.add(new_target).delete(this.current_target);;
		this.current_target = new_target;

		transform_to(this.element, new_target);
	};


	// make a worker move and do its task
	const start = async function ()
	{
		this.is_active = true;
		do {
			this.move_to_next_target();
			await this.do_task();
		} while (this.is_active);
	};


	// append to DOM and start working
	const init = async function ()
	{
		document.body.appendChild(this.element);
		this.start();
	};


	// return the actual constructor
	// The last two arguments want keys to the ‘behaviour_functions’ dictionary above.
	return function (
		targets, // an array of DOM elements
		current_target_index = 0, // index of the element to start with
		movement_func = 'random', // order in which elements are processed
		task_func = 'nothing' // what the worker does with the element
	) {
		// create the DOM element
		const element = document.createElement('div');
		element.className = 'worker';

		// properties
		this.element = element;
		this.targets = targets;
		this.current_target = targets[current_target_index];
		this.current_target_index = current_target_index;
		this.is_active = false;

		// methods
		this.move_to_next_target = move_to_next_target;
		this.start = start;
		this.init = init;

		// behaviour
		this.do_task = behaviour_functions.task[task_func];
		this.next_target_index = behaviour_functions.next_target_index[movement_func];
	};
})();


// create a fixed number of workers
const workers = new Array(20);
{
	const targets = document.getElementsByClassName('word');
	for (let worker, i = workers.length-1; i >= 0; --i)
	{
		worker = new Worker(targets, random_int(0, targets.length-1));
		worker.init();
		workers[i] = worker;
	}
}


// stops all workers
const halt = () =>
{
	for (const worker of workers)
	{
		worker.is_active = false;
		worker.element.classList.add('paused');
	}
};


// (re)starts all workers
const start = () =>
{
	for (const worker of workers)
	{
		worker.element.classList.remove('paused');
		worker.start();
	}
};

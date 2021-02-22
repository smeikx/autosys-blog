-- This program takes a list of paths to packages as arguments.
-- A package is just a directory containing ‘meta.txt’, ‘content.md’ and accompanying media files.
-- This program takes a list of package paths as arguments.
-- The order of the arguments defines the order they appear on the homepage.

-- This assumes thes ‘Discount’ markdown implementation:
-- https://www.pell.portland.or.us/~orc/Code/discount/

-- if this is true, CSS and JS is hardlinked instead of copied
local LINK <const> = true
if LINK then print('Careful! CSS and JS is hard linked!') end

local OUT_PATH <const> = 'output'
assert(os.execute('mkdir '..OUT_PATH))


local TEMPLATES <const> = {}
for _,template in ipairs{'home', 'post', 'preview', 'footer', 'meta', 'thumbnail', 'site-title', 'about'}
do
	local file <close> = assert(io.open('templates/'..template..'.html'))
	TEMPLATES[template] = file:read('a')
end


for _,template in ipairs{'home', 'post', 'about'}
do
	TEMPLATES[template] = TEMPLATES[template]:gsub('{{{([%w_-]+)}}}', TEMPLATES)
end

do
	local about <close> = assert(io.open(OUT_PATH..'/about.html', 'w'))
	about:write(TEMPLATES.about .. '\n')
end

local count = 0
local urls = {}
local function parse_post (package_path)
	count = count + 1
	print(string.format('%i parsing ‘%s’ …', count, package_path))
	local post <const> =
	{
		title = '',
		date = '',
		datetime = '',
		author = '',
		tags = {},
		content = '',
		teaser = '',
		thumbnail = '',
		meta = '',
		preview = '',
		url = ''
	}

	-- parse meta data (date, author, tags, thumbnail)
	do
		local meta_file <close> = assert(io.open(package_path..'/meta.txt'))
		local content <const> = meta_file:read('a')

		post.datetime = assert(
			content:match('date:%s*(%d%d%d%d%-[01]%d%-[0-3]%d)%s*'),
			string.format('Incorrectly formatted date: %s\n', content))
		do
			local y,m,d = post.datetime:match('(%d%d%d%d)%-([01]%d)%-([0-3]%d)')
			post.date = string.format('%s.%s.%s', d, m, y)
		end
		post.author = content:match('author:%s*([^\n]+)'):match('^(.*%S)%s*')
		do
			local i = 0
			for tag in content:match('tags:%s*([^\n]+)'):gmatch('[^;]+')
			do
				i = i + 1
				post.tags[i] = tag:match('^%s*(.*%S)%s*')
			end
		end

		do
			local thumbnail = content:match('thumbnail:%s*([^\n]+)')
			--post.thumbnail = thumbnail and TEMPLATES.thumbnail:gsub('{{{thumbnailurl}}}', thumbnail:match('^(.*%S)%s*')) or ''
			post.thumbnail = thumbnail and thumbnail:match('^(.*%S)%s*') or ''
		end
	end

	-- set URL
	-- to avoid conflicting names for posts on the same date, an increasing number is appended
	urls[post.datetime] = urls[post.datetime] and urls[post.datetime] + 1 or 1
	post.url = post.datetime..'_'..urls[post.datetime]..'/'

	if post.thumbnail ~= '' then
		post.thumbnail = TEMPLATES.thumbnail:gsub('{{{thumbnailurl}}}', post.url .. post.thumbnail)
	end

	-- generate meta HTML
	post.meta = TEMPLATES.meta:gsub('{{{([%w_-]+)}}}', post)

	-- parse markdown
	local markdown <close> = assert(io.popen(string.format("markdown -f '-smarty,+fencedcode' '%s/content.md'", package_path)))
	local content <const> = markdown:read('a')

	-- extract title → first H1
	post.title = content:match('<h1>([^<]+)</h1>')

	-- extract teaser → first paragraph (repeated to 200 characters)
	do
		local _, teaser_start = content:find('<p>')
		local teaser_end, _ = content:find('</p>')
		local teaser = content:sub(teaser_start + 1, teaser_end - 1)
		post.teaser = teaser:rep(math.ceil(200 / teaser:len()), ' ')
	end

	-- inject meta HTML into content after title
	do
		local _, title_end = content:find('</h1>')
		post.content = content:sub(0, title_end) .. post.meta .. content:sub(title_end + 1)
	end

	-- generate preview HTML
	post.preview = TEMPLATES.preview:gsub('{{{([%w_-]+)}}}', post)

	return post
end


local PREVIEWS <const> = {}
for i, package_path in ipairs(arg)
do
	local post <const> = parse_post(package_path)

	-- set path and create dictionary for post’s content
	local out_path <const> = OUT_PATH..'/'..post.url
	assert(os.execute(string.format("mkdir '%s'", out_path)))

	-- write the post’s HTML
	local page <close> = assert(io.open(out_path..'/index.html', 'w'))
	page:write(TEMPLATES.post:gsub('{{{([%w_-]+)}}}', post) .. '\n')

	-- copy all relevant media files with the help of a script
	assert(os.execute(string.format("helpers/copy-media.sh '%s' '%s'", package_path, out_path)))

	-- record the preview for the creation of the homepage
	PREVIEWS[i] = post.preview
end


-- copy all shared files (CSS, JS) to destination
assert(os.execute(string.format("cp -r %s bios css js fonts '%s/'", (LINK and '-l' or ''), OUT_PATH)))


-- write the home page
do
	local homepage <close> = assert(io.open(OUT_PATH..'/index.html', 'w'))
	homepage:write(TEMPLATES.home:gsub('{{{previews}}}', table.concat(PREVIEWS)) .. '\n')
end

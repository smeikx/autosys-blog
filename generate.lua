-- This program takes a list of paths to packages as arguments.
-- A package is just a directory containing ‘meta.txt’, ‘content.md’ and accompanying media files.
-- This program takes a list of package paths as arguments.
-- The order of the arguments defines the order they appear on the homepage.

--[[
	TODO:
	sort processed after date
	compose previews
	compose posts
		insert author & date into processed markdown

	Site Structure:
		Homepage (Previews)
		Post (multiple)
]]--

local OUT_PATH <const> = 'generated'
assert(os.execute('mkdir '..OUT_PATH))


local TEMPLATES <const> = {}
for _,template in ipairs{'home', 'post', 'preview', 'footer', 'meta'}
do
	local file <close> = assert(io.open('templates/'..template..'.html'))
	TEMPLATES[template] = file:read('a')
end


local POSTS <const> = {}
local function parse_post (package_path)
	local post <const> =
	{
		date = '',
		datetime = '',
		author = '',
		tags = {},
		meta = '',
		content = '',
		teaser = '',
		thumbnail = '',
		title = ''
	}
	do
		local meta_file <close> = assert(io.open(package_path..'/meta.txt'))
		local content = meta_file:read('a')

		post.datetime = content:match('date:%s*(%d%d%d%d%-[01][1-9]%-[0-3][1-9])%s*')
		do
			local y,m,d = post.datetime:match('(%d%d%d%d)%-([01][1-9])%-([0-3][1-9])')
			post.date = string.format('%s.%s.%s', d, m, y)
		end
		post.author = content:match('author:%s*([^\n]+)'):match('^(.*%S)%s*')
		do
			local i = 0
			for tag in meta:match('tags:%s*([^\n]+)'):gmatch('[^;]+')
			do
				i = i + 1
				meta.tags[i] = tag:match('^%s*(.*%S)%s*')
			end
		end

		post.thumbnail = content:match('thumbnail:%s*([^\n]+)'):match('^(.*%S)%s*')
	end

	local markdown <close> = assert(io.popen(string.format("markdown -f '-smarty,+fencedcode' '%s/content.md'", package_path)))
	local content = markdow:read('a')

	post.title = content:match('<h1>([^<]+)</h1>')

	do
		local _, title_end = content:find('</h1>')
		post.content = content:sub(0, title_end) .. '{{{meta}}}' .. content:sub(title_end)
	end

	do
		local _, teaser_start = content:find('<p>')
		local teaser_end, _ = content:find('</p>')
		local teaser = content:sub(teaser_start + 1, teaser_end - 1)
		post.teaser = teaser:rep(math.ceil(200 / teaser:len())):sub(0, 200)
	end
end

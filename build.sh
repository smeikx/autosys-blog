#!/bin/sh

posts_dir='posts'

test -d output && rm -r output

# Get all post paths in alphabetical (chronological) order …
post_list="$(find $posts_dir -maxdepth 1 -name '*.blog' -not -ipath posts | sort -r)"

printf 'Post paths:\n%s\n' "$post_list"

# … and reduce them to one line.
post_list="$(printf '%s\n' $post_list | tr '\n' ' ')"

echo '- - - - - - - - - - - - - - - - - - - - - - - - - - - - -'

lua generate.lua $post_list

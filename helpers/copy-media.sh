#!/bin/sh

# This script copys all files other than ‘content.md’ and ‘meta.txt’ from the package path (first arg) to the target path (second arg).
# XXX This asumes GNU cp, using the -t flag. It could probably be made more portable using xargs and \n as delimiter.

package_path="$1"
target_path="$2"

find "$package_path" \
	-not -ipath "$package_path" \
	-not -name 'content.md' \
	-not -name 'meta.txt' \
	-exec cp -t "$target_path" {} +

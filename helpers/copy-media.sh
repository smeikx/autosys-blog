#!/bin/sh

package_path="$1"
target_path="$2"

find "$package_path" \
	-not -ipath "$package_path" \
	-not -name 'content.md' \
	-not -name 'meta.txt' \
	-exec cp -t "$target_path" {} +

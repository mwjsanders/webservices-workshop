#!/usr/bin/env bash
WORKSHOP_FILE="src/WORKSHOP.md"
cp -r src/images docs/
pandoc -c pandoc.css "$WORKSHOP_FILE" -o docs/index.html

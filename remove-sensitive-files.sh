#!/bin/bash

# This script helps remove sensitive files from Git history

# Remove .env files from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env .env.local server/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push changes to remote repository
echo "Now run: git push origin --force --all"
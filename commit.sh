#!/bin/bash
#Usage sh commit.sh <commit message> <origin branch>

echo mysql dump:
mysqldump -u root -p GSagrav2 > ./dbcreation/completo.sql

echo "Committing..."
git commit -a -S -m "$1"

echo "Pushing"
git push origin $2
#!/usr/bin/env bash
set -e
rm -rf front-app/src
cp -r my-src-backup front-app/src
echo "src restored at $(date)"

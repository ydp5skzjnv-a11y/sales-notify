#!/bin/sh
cd "$(dirname "$0")"
npm install && npx netlify login && npx netlify deploy --prod

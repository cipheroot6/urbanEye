#!/bin/bash
echo "Updating Edge Agent Configuration..."
echo "Please enter your deployed Vercel URL (e.g. https://urbaneye.vercel.app):"
read VERCEL_URL

if [[ -z "$VERCEL_URL" ]]; then
  echo "Error: Vercel URL cannot be empty."
  exit 1
fi

echo "INGEST_URL=$VERCEL_URL/api/ingest" > edge-agent/.env.production
echo "Created edge-agent/.env.production with the new INGEST_URL!"
echo "Make sure to run your agent using the production env file."

#!/usr/bin/env bash
set -euo pipefail

# setup-bechalof.sh
# Automated helper to create a GitHub repo from the local project,
# push code, create & deploy a Netlify site, and enable Identity + Git Gateway.
#
# USAGE:
# 1) Create a .env file in this directory with the following variables (DO NOT share this file):
#    GITHUB_TOKEN=ghp_....
#    NETLIFY_AUTH_TOKEN=... 
# 2) Inspect the script, then run:
#    bash ./setup-bechalof.sh
#
# NOTES:
# - The script expects to be run from the project root (/home/faris/bechalof).
# - It will create a private GitHub repo under the authenticated account.
# - It will push the current git history; if repo has no commits, the script will create an initial commit.
# - It will create a Netlify site and trigger an initial deploy of the `public` folder.
# - If Netlify GitHub app linking requires manual authorization, the script will still upload a deploy using the CLI.

REPO_NAME="bechalof"
PUBLISH_DIR="public"
BRANCH="master"

echo "Loading .env (if present)..."
if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a
  source .env
  set +a
else
  echo "ERROR: .env file not found in $(pwd). Create .env with GITHUB_TOKEN and NETLIFY_AUTH_TOKEN and retry."
  exit 1
fi

if [ -z "${GITHUB_TOKEN:-}" ] || [ -z "${NETLIFY_AUTH_TOKEN:-}" ]; then
  echo "ERROR: GITHUB_TOKEN and NETLIFY_AUTH_TOKEN must be set in .env"
  exit 1
fi

# confirm user intention
read -p "This script will create a GitHub repo (private) and a Netlify site and push your local repo. Continue? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted by user."; exit 0
fi

# Ensure inside project root
if [ ! -f "public/index.html" ]; then
  echo "WARNING: couldn't find public/index.html — make sure you run this in project root";
fi

# Initialize git if needed
if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit for Bechalof site"
fi

# Create GitHub repo
echo "Creating GitHub repo: $REPO_NAME ..."
CREATE_RESP=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
  -d "{\"name\":\"${REPO_NAME}\", \"private\": true, \"description\":\"Bechalof site\"}" \
  https://api.github.com/user/repos)

CLONE_HTTPS=$(echo "$CREATE_RESP" | jq -r .clone_url)
if [ -z "$CLONE_HTTPS" ] || [ "$CLONE_HTTPS" = "null" ]; then
  echo "GitHub repo creation failed. Response:";
  echo "$CREATE_RESP" | jq .
  exit 1
fi

echo "Created repo: $CLONE_HTTPS"

# Push local repo
git remote remove origin 2>/dev/null || true
git remote add origin "$CLONE_HTTPS"

echo "Pushing local branch $BRANCH to origin..."
git push -u origin $BRANCH

# Ensure netlify CLI available
if ! command -v netlify >/dev/null 2>&1; then
  echo "netlify CLI not found. Installing (requires npm & permissions)..."
  npm i -g netlify-cli
fi

# Create Netlify site
SITE_NAME="bechalof-$(date +%s)"
export NETLIFY_AUTH_TOKEN="${NETLIFY_AUTH_TOKEN}"

echo "Creating Netlify site (name guess: $SITE_NAME) ..."
SITE_CREATE=$(netlify sites:create --name "$SITE_NAME" --path . --json 2>/dev/null || true)
if [ -z "$SITE_CREATE" ] || [ "$SITE_CREATE" = "null" ]; then
  echo "CLI create failed; trying Netlify API..."
  SITE_CREATE=$(curl -s -X POST -H "Authorization: Bearer ${NETLIFY_AUTH_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${SITE_NAME}\"}" \
    https://api.netlify.com/api/v1/sites)
fi

SITE_ID=$(echo "$SITE_CREATE" | jq -r .id)
DEPLOY_URL=$(echo "$SITE_CREATE" | jq -r .ssl_url // .url)

if [ -z "$SITE_ID" ] || [ "$SITE_ID" = "null" ]; then
  echo "Netlify site creation failed. Response:";
  echo "$SITE_CREATE" | jq .
  exit 1
fi

echo "Netlify site created: $DEPLOY_URL (id: $SITE_ID)"

# Link repo to Netlify site for continuous deploy
OWNER=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/user | jq -r .login)
REPO_FULL="${OWNER}/${REPO_NAME}"

echo "Linking Netlify site to GitHub repo ${REPO_FULL} for continuous deploy..."
# API call to set repository (if permitted by Netlify account permissions)
curl -s -X POST -H "Authorization: Bearer ${NETLIFY_AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"repo\":\"https://github.com/${REPO_FULL}\"}" \
  "https://api.netlify.com/api/v1/sites/${SITE_ID}/repository" >/dev/null || true

# Trigger an initial deploy via netlify CLI using local directory
echo "Triggering initial deploy of $PUBLISH_DIR to Netlify site (this may take a moment)..."
netlify deploy --dir="$PUBLISH_DIR" --site="$SITE_ID" --prod --auth="$NETLIFY_AUTH_TOKEN"

# Enable Identity & Git Gateway via Netlify API (best-effort)
echo "Enabling Identity service..."
curl -s -X POST -H "Authorization: Bearer ${NETLIFY_AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"provider":null,"config":{}}' \
  "https://api.netlify.com/api/v1/sites/${SITE_ID}/identity" >/dev/null || true

echo "Enabling Git Gateway..."
curl -s -X POST -H "Authorization: Bearer ${NETLIFY_AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"provider\":\"github\"}" \
  "https://api.netlify.com/api/v1/sites/${SITE_ID}/services/git-gateway" >/dev/null || true

echo "\nDone. Site is available at: $DEPLOY_URL"
echo "Open $DEPLOY_URL/admin to sign in via Netlify Identity and edit content."

exit 0

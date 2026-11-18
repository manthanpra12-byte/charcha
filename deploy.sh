#!/usr/bin/env bash
# Charcha deployment script. Runs ON THE EC2 SERVER.
# Used both manually (bash ~/charcha/deploy.sh) and by GitHub Actions.

# Stop at the first error, treat unset variables as errors, and fail if any part of a pipe fails
set -euo pipefail

# Everything is inside a function, so bash reads the WHOLE script before running it.
# (This script updates itself via git; without the function, bash could read a half-old, half-new file.)
main() {
  echo "==> 1/6 Getting the latest code from GitHub"
  cd ~/charcha
  git fetch origin main
  git reset --hard origin/main   # make the server's code exactly match GitHub (.env is not tracked, so it is untouched)

  echo "==> 2/6 Backend: installing dependencies"
  cd ~/charcha/backend
  npm ci --omit=dev

  echo "==> 3/6 Frontend: installing dependencies and building"
  cd ~/charcha/frontend
  npm ci
  npm run build

  echo "==> 4/6 Publishing the website files"
  sudo rsync -a --delete dist/ /var/www/charcha/   # copy the new build; remove files from old builds

  echo "==> 5/6 Restarting the backend"
  pm2 restart charcha-api --update-env
  pm2 save

  echo "==> 6/6 Health check"
  sleep 3   # give Express a moment to connect to MongoDB
  curl -fsS http://localhost:5000/api/health   # -f makes curl (and the script) fail if the API is not OK
  echo
  echo "==> Deployed commit $(git -C ~/charcha rev-parse --short HEAD) successfully"
}

main "$@"
#!/bin/sh

set -e

echo "Starting Ecommerce API..."

sh docker/wait-for-db.sh

echo "Running migrations..."
npm run migrate

echo "Starting server..."
exec npm run start
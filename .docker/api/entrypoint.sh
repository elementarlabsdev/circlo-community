#!/bin/sh
set -e

# Apply Prisma migrations and start the application
npx prisma migrate deploy
npx prisma db seed

# Run the main container command
exec "$@"

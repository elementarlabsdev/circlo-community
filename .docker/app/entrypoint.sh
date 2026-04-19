#!/bin/sh

# Use exec to ensure the process receives termination signals correctly
exec npm run start:prod

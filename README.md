Circlo is a comprehensive ecosystem for content creators, communities, and 
online education. It is a hybrid of a publishing platform (similar to Medium or Substack),
a community management system (similar to Discord or Slack), 
and a course platform (LMS).


SSH key generation
ssh-keygen -t ed25519 -C "pavel.salauyou@gmail.com"

Prisma helpers
- npx prisma migrate dev
- npx prisma db seed
- npx prisma migrate reset

For localhost testing:
./stripe listen --forward-to localhost:3000/api/v1/payments/webhook


## BUILD
docker compose -f docker-compose.yml build

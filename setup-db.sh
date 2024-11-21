#!/bin/bash
# setup-db.sh

# Create database and user
psql postgres <<EOF
CREATE DATABASE mathwhiz_db;
CREATE USER mathwhiz_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mathwhiz_db TO mathwhiz_user;
\c mathwhiz_db
GRANT ALL ON ALL TABLES IN SCHEMA public TO mathwhiz_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO mathwhiz_user;
EOF

# Run migrations and seeds
# npm run migration:run
# npm run seed:run
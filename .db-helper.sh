#!/bin/bash
# Database Helper Script
# Source this file or use it to query your database

# Set your database connection string here
# export DATABASE_URL="postgresql://postgres:password@your-db-host:5432/postgres"

# Uncomment after setting DATABASE_URL above
# Then you can use: psql $DATABASE_URL -c "your query"

# Helper functions
db_list_tables() {
    psql $DATABASE_URL -c "\dt public.*"
}

db_describe_table() {
    psql $DATABASE_URL -c "\d+ $1"
}

db_query() {
    psql $DATABASE_URL -c "$1"
}

# Example usage:
# source .db-helper.sh
# db_list_tables
# db_describe_table books
# db_query "SELECT * FROM books LIMIT 5"


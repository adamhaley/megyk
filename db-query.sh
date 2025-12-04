#!/bin/bash
# Database Query Helper - Uses Supabase REST API
# Usage: ./db-query.sh [command] [args]

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

API_URL="${NEXT_PUBLIC_SUPABASE_URL}/rest/v1"
API_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

# Helper function to make API requests
api_request() {
    local endpoint="$1"
    local params="$2"
    curl -s "${API_URL}${endpoint}${params}" \
        -H "apikey: ${API_KEY}" \
        -H "Authorization: Bearer ${API_KEY}"
}

# Command handlers
case "$1" in
    "list-tables")
        echo "Available tables:"
        curl -s "${API_URL}/" -H "apikey: ${API_KEY}" | jq -r '.paths | keys[]' | grep -v '^/rpc/' | sed 's|^/||' | sort | uniq
        ;;
    
    "describe")
        if [ -z "$2" ]; then
            echo "Usage: $0 describe <table_name>"
            exit 1
        fi
        TABLE="$2"
        echo "Schema for table: $TABLE"
        curl -s "${API_URL}/" -H "apikey: ${API_KEY}" | jq ".definitions.${TABLE}.properties"
        ;;
    
    "count")
        if [ -z "$2" ]; then
            echo "Usage: $0 count <table_name>"
            exit 1
        fi
        TABLE="$2"
        api_request "/${TABLE}" "?select=count" -H "Prefer: count=exact" | jq .
        ;;
    
    "select")
        if [ -z "$2" ]; then
            echo "Usage: $0 select <table_name> [limit]"
            exit 1
        fi
        TABLE="$2"
        LIMIT="${3:-5}"
        echo "Fetching ${LIMIT} rows from ${TABLE}:"
        api_request "/${TABLE}" "?limit=${LIMIT}" | jq .
        ;;
    
    "query")
        if [ -z "$2" ]; then
            echo "Usage: $0 query <table_name> '<filters>' [limit]"
            echo "Example: $0 query books 'status=eq.live' 10"
            exit 1
        fi
        TABLE="$2"
        FILTER="$3"
        LIMIT="${4:-10}"
        api_request "/${TABLE}" "?${FILTER}&limit=${LIMIT}" | jq .
        ;;
    
    "schema")
        echo "Full database schema (OpenAPI):"
        curl -s "${API_URL}/" -H "apikey: ${API_KEY}" | jq .
        ;;
    
    *)
        echo "Database Query Helper"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  list-tables              - List all available tables"
        echo "  describe <table>         - Show table schema"
        echo "  count <table>            - Count rows in table"
        echo "  select <table> [limit]   - Select rows from table (default limit: 5)"
        echo "  query <table> '<filter>' [limit] - Query with filters"
        echo "  schema                   - Show full database schema"
        echo ""
        echo "Examples:"
        echo "  $0 list-tables"
        echo "  $0 describe books"
        echo "  $0 count books"
        echo "  $0 select books 10"
        echo "  $0 query books 'status=eq.live' 5"
        ;;
esac


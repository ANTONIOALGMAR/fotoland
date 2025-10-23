#!/bin/sh
echo "--- Running Network Diagnostics ---"

echo "--- Resolving Supabase host (nslookup) ---"
nslookup db.zijchejcunhvtvrihdfe.supabase.co

echo "--- Pinging Supabase host (ping) ---"
ping -c 4 db.zijchejcunhvtvrihdfe.supabase.co

echo "--- Starting Application --- 

"
java -jar app.jar

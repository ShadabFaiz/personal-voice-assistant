#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Set NODE_EXTRA_CA_CERTS if CUSTOM_CA_CERT_PATH is provided
if [ -n "$CUSTOM_CA_CERT_PATH" ]; then
  export NODE_EXTRA_CA_CERTS="$CUSTOM_CA_CERT_PATH"
  echo "Proxy CA Cert set: $NODE_EXTRA_CA_CERTS"
fi

# Start the application
npx nest start --builder swc --watch

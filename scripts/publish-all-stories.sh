#!/bin/bash

# Publish all draft stories in Storyblok
# Usage: ./scripts/publish-all-stories.sh

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get Management API token from env or prompt
if [ -z "$STORYBLOK_MANAGEMENT_TOKEN" ]; then
  echo -e "${RED}Error: STORYBLOK_MANAGEMENT_TOKEN not set${NC}"
  echo "Get your token from: https://app.storyblok.com/#!/me/account?tab=token"
  echo "Then run: export STORYBLOK_MANAGEMENT_TOKEN='your-token'"
  exit 1
fi

SPACE_ID="281211"
BASE_URL="https://mapi.storyblok.com/v1/spaces/${SPACE_ID}/stories"

echo -e "${BLUE}Fetching all stories...${NC}"

# Get all stories
STORIES=$(curl -s "${BASE_URL}?token=${STORYBLOK_MANAGEMENT_TOKEN}" | jq -r '.stories[] | select(.is_folder == false) | "\(.id) \(.name) \(.published_at)"')

echo "$STORIES" | while read -r story_id story_name published_at; do
  if [ -z "$published_at" ] || [ "$published_at" = "null" ]; then
    echo -e "${BLUE}Publishing: ${story_name}${NC}"

    # Publish the story
    RESPONSE=$(curl -s -X PUT \
      "${BASE_URL}/${story_id}/publish" \
      -H "Authorization: ${STORYBLOK_MANAGEMENT_TOKEN}" \
      -H "Content-Type: application/json")

    if echo "$RESPONSE" | jq -e '.story' > /dev/null 2>&1; then
      echo -e "${GREEN}✓ Published: ${story_name}${NC}"
    else
      echo -e "${RED}✗ Failed: ${story_name}${NC}"
      echo "$RESPONSE" | jq '.'
    fi
  else
    echo -e "Already published: ${story_name}"
  fi
done

echo -e "${GREEN}Done!${NC}"

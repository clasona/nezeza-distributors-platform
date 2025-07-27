#!/bin/bash

echo "🔍 Checking current Git status..."
git status

echo ""
echo "📝 Recent file changes:"
git diff --name-status

echo ""
echo "➕ Adding all changes to staging..."
git add .

echo ""
echo "🤖 Analyzing changes for commit message..."

# Check what files were modified
MODIFIED_FILES=$(git diff --cached --name-only)

# Initialize commit message parts
COMMIT_PARTS=""

# Check for email template changes
if echo "$MODIFIED_FILES" | grep -q "email.*Utils\.js"; then
  COMMIT_PARTS="$COMMIT_PARTS- Enhanced email templates with delivery dates and seller next steps\n"
fi

# Check for payment success changes
if echo "$MODIFIED_FILES" | grep -q "payment-success"; then
  COMMIT_PARTS="$COMMIT_PARTS- Improved payment success page with retry logic for webhook timing\n"
fi

# Check for buyer/seller email changes
if echo "$MODIFIED_FILES" | grep -q "buyerPaymentEmailUtils\|sellerOrderEmailUtils"; then
  COMMIT_PARTS="$COMMIT_PARTS- Updated buyer and seller email templates with comprehensive order details\n"
fi

# Check for format utils changes
if echo "$MODIFIED_FILES" | grep -q "formatUtils"; then
  COMMIT_PARTS="$COMMIT_PARTS- Enhanced address formatting for better email display\n"
fi

# Generate final commit message
if [ -n "$1" ]; then
  FINAL_MESSAGE="$1"
else
  if [ -n "$COMMIT_PARTS" ]; then
    FINAL_MESSAGE="feat: Enhance email templates and payment success flow

$(echo -e "$COMMIT_PARTS")
- Added estimated delivery dates to buyer confirmation emails
- Included seller action steps and next steps guidance
- Implemented retry logic for payment success page webhook timing
- Improved email template structure and visual hierarchy"
  else
    FINAL_MESSAGE="chore: Update codebase with recent improvements"
  fi
fi

echo "📋 Generated commit message:"
echo "$FINAL_MESSAGE"
echo ""

echo "💾 Committing with message..."
git commit -m "$FINAL_MESSAGE"

echo "🚀 Pushing changes to remote repository..."
git push

echo "✅ Successfully committed and pushed changes!"
echo "🎉 Your enhanced email templates and payment improvements are now live!"

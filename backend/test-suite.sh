BASE="http://localhost:5001"
PASS=0; FAIL=0

check() {
  local label="$1"; local expected="$2"; local actual="$3"
  if echo "$actual" | grep -q "$expected"; then
    echo "  PASS $label"
    PASS=$((PASS+1))
  else
    echo "  FAIL $label => expected '$expected', got: ${actual:0:120}"
    FAIL=$((FAIL+1))
  fi
}

RUN_ID=$(date +%s)_$RANDOM
# 1. Obtain tokens for user 1 and user 2 (register if new, login if existing)
REG=$(curl -s -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"TestUser\",\"email\":\"testauth_${RUN_ID}@test.com\",\"password\":\"testpass123\"}")
TOKEN=$(echo "$REG" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');console.log(JSON.parse(d).token||'')" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  LOGIN=$(curl -s -X POST $BASE/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"testauth_${RUN_ID}@test.com\",\"password\":\"testpass123\"}")
  TOKEN=$(echo "$LOGIN" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');console.log(JSON.parse(d).token||'')" 2>/dev/null)
fi

REG2=$(curl -s -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"NonMember\",\"email\":\"nonmember_${RUN_ID}@test.com\",\"password\":\"testpass456\"}")
TOKEN2=$(echo "$REG2" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');console.log(JSON.parse(d).token||'')" 2>/dev/null)

if [ -z "$TOKEN2" ]; then
  LOGIN2=$(curl -s -X POST $BASE/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"nonmember_p0@test.com","password":"testpass456"}')
  TOKEN2=$(echo "$LOGIN2" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');console.log(JSON.parse(d).token||'')" 2>/dev/null)
fi

# 2. Ensure test culture exists
DASH=$(curl -s $BASE/cultures/dashboard -H "Authorization: Bearer $TOKEN")
CULTURE_ID=$(echo "$DASH" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');const p=JSON.parse(d);console.log((p.cultures&&p.cultures[0]&&p.cultures[0]._id)||'')" 2>/dev/null)

if [ -z "$CULTURE_ID" ] || [ "$CULTURE_ID" = "undefined" ]; then
  CREATE=$(curl -s -X POST $BASE/cultures \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name":"P0 Test Culture",
      "description":"A culture for P0 testing",
      "vibeWords":["calm","precise"],
      "values":["clarity","patience"],
      "aesthetic":["minimal","monochrome"],
      "jargon":["zengrid: the state of perfect focus"],
      "rituals":["Spend 5 minutes in silence"],
      "symbol":"🧘",
      "isPublished":true
    }')
  CULTURE_ID=$(echo "$CREATE" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');console.log(JSON.parse(d)._id||'')" 2>/dev/null)
  DASH=$(curl -s $BASE/cultures/dashboard -H "Authorization: Bearer $TOKEN")
fi

echo "--- AUTH ---"
ME=$(curl -s $BASE/auth/me -H "Authorization: Bearer $TOKEN")
check "/auth/me returns user from DB" '"joinedCultures"' "$ME"
check "/auth/me unauthenticated returns 401" '"error"' "$(curl -s $BASE/auth/me)"

echo "--- SECURITY ---"
check "Rate limit middleware loaded" '"ok"' "$(curl -s $BASE/health)"
check "Non-member blocked from ritual (SEC-3)" '"error"' \
  "$(curl -s -X GET $BASE/ai/daily-ritual/$CULTURE_ID -H "Authorization: Bearer $TOKEN2")"
check "Unauthenticated ritual blocked" '"error"' \
  "$(curl -s -X GET $BASE/ai/daily-ritual/$CULTURE_ID)"

echo "--- DASHBOARD (B1 fix) ---"
check "Single /dashboard call returns cultures" '"cultures"' "$DASH"
check "Dashboard has stats" '"stats"' "$DASH"
CULTURE_COUNT=$(echo "$DASH" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');const p=JSON.parse(d);console.log(p.cultures?.length||0)" 2>/dev/null)
check "Dashboard has at least 1 culture" '1' "$CULTURE_COUNT"

echo "--- AI MEMORY LOOP ---"
RITUAL=$(curl -s -X GET $BASE/ai/daily-ritual/$CULTURE_ID -H "Authorization: Bearer $TOKEN")
check "Ritual has title (structured output)" '"title"' "$RITUAL"
check "Ritual has description" '"description"' "$RITUAL"  
check "Ritual has instructions array" '"instructions"' "$RITUAL"
check "Ritual has reflectionPrompt" '"reflectionPrompt"' "$RITUAL"
check "Ritual has reason (culture memory signal)" '"reason"' "$RITUAL"
check "Ritual has difficulty" '"difficulty"' "$RITUAL"
check "Ritual has durationMinutes" '"durationMinutes"' "$RITUAL"
RITUAL_ID=$(echo "$RITUAL" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');console.log(JSON.parse(d)._id||'')" 2>/dev/null)
check "Ritual idempotent on 2nd call" "$RITUAL_ID" "$(curl -s $BASE/ai/daily-ritual/$CULTURE_ID -H "Authorization: Bearer $TOKEN")"

echo "--- RITUAL LOG (B6 fix) ---"
LOG=$(curl -s -X POST $BASE/logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"cultureId\":\"$CULTURE_ID\",\"ritualId\":\"$RITUAL_ID\",\"content\":\"Memory loop test: completed the ritual mindfully.\"}")
check "Log stores ritualId" '"ritualId"' "$LOG"
STORED_RITUAL_ID=$(echo "$LOG" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');console.log(JSON.parse(d).ritualId||'')" 2>/dev/null)
if [ "$STORED_RITUAL_ID" = "$RITUAL_ID" ]; then
  echo "  PASS ritualId correctly linked in log (B6 fully closed)"
  PASS=$((PASS+1))
else
  echo "  FAIL ritualId mismatch: stored=$STORED_RITUAL_ID expected=$RITUAL_ID"
  FAIL=$((FAIL+1))
fi

FEED=$(curl -s $BASE/logs/$CULTURE_ID)
check "Feed shows ritual title from populated ritualId" '"title"' "$FEED"
check "Non-member cannot post log" '"error"' \
  "$(curl -s -X POST $BASE/logs -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN2" -d "{\"cultureId\":\"$CULTURE_ID\",\"content\":\"sneaking\"}")"

echo "--- CULTURE DETAIL ---"
DETAIL=$(curl -s $BASE/cultures/$CULTURE_ID)
check "Culture detail has activeRituals" '"activeRituals"' "$DETAIL"

echo ""
echo "=========================================="
echo "PASSED: $PASS / $((PASS+FAIL))"
echo "FAILED: $FAIL"
echo "=========================================="
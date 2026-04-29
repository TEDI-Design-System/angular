#!/bin/bash
# Post-edit hook: finds and runs the nearest spec file when a component file is edited.
# Reads file path from stdin JSON (PostToolUse hook format).
# Exits 0 always — test failures are reported as output, not as hook failures.

INPUT=$(cat /dev/stdin)
ABSOLUTE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$ABSOLUTE_PATH" ]]; then
  exit 0
fi

# Convert absolute path to relative path from project root
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
if [[ -n "$CWD" ]]; then
  FILE="${ABSOLUTE_PATH#$CWD/}"
else
  FILE="$ABSOLUTE_PATH"
fi

# Only trigger for component source files in tedi/
if [[ ! "$FILE" =~ ^tedi/ ]]; then
  exit 0
fi

# Skip if the edited file is itself a spec or story
if [[ "$FILE" =~ \.(spec|stories)\. ]]; then
  exit 0
fi

# Derive the spec file path
SPEC="${FILE%.*}.spec.${FILE##*.}"
# Handle .component.ts -> .component.spec.ts
if [[ "$FILE" =~ \.component\.ts$ ]]; then
  SPEC="${FILE%.component.ts}.component.spec.ts"
elif [[ "$FILE" =~ \.component\.html$ ]]; then
  SPEC="${FILE%.component.html}.component.spec.ts"
elif [[ "$FILE" =~ \.component\.scss$ ]]; then
  SPEC="${FILE%.component.scss}.component.spec.ts"
elif [[ "$FILE" =~ \.directive\.ts$ ]]; then
  SPEC="${FILE%.directive.ts}.directive.spec.ts"
elif [[ "$FILE" =~ \.service\.ts$ ]]; then
  SPEC="${FILE%.service.ts}.service.spec.ts"
fi

# Run test if spec file exists
if [[ -f "$SPEC" ]]; then
  echo "Running: npx jest $SPEC"
  if ! npx jest "$SPEC" --no-coverage 2>&1; then
    echo "Auto-test failed (non-blocking)."
  fi
else
  echo "No spec file found at $SPEC — skipping auto-test."
fi

exit 0

#!/usr/bin/env bash
# Simulate environment where yt-dlp and ffmpeg are not in PATH

# Detect correct PATH separator for Windows vs POSIX
SEP=';'
if [[ "$PATH" == *":"* && "$PATH" != *";"* ]]; then
  SEP=':'
fi

# Backup original PATH
ORIGINAL_PATH="$PATH"

# Filter out directories containing yt-dlp or ffmpeg binaries
CLEAN_PATH=$(echo "$ORIGINAL_PATH" | tr ';:' '\n' | grep -viE 'yt-dlp|ffmpeg' | paste -sd "$SEP")

# Ensure PNPM path is preserved
if ! echo "$CLEAN_PATH" | grep -qi "pnpm"; then
  PNPM_DIR=$(dirname "$(which pnpm 2>/dev/null)")
  CLEAN_PATH="${CLEAN_PATH}${SEP}${PNPM_DIR}"
fi

# Run the app with filtered PATH
PATH="$CLEAN_PATH" pnpm start:win-unpack

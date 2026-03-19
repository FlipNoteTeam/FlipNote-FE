#!/bin/sh

# Merge commit, commit --amend, rebase, cherry-pick 등은 스킵
if [ "$2" = "merge" ] || [ "$2" = "commit" ] || [ "$2" = "squash" ]; then
    exit
fi

# rebase나 cherry-pick 진행 중인지 체크
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ] || [ -d ".git/sequencer" ]; then
    exit
fi

# 브랜치에서 Jira 이슈 키 추출
ISSUE_KEY=$(git branch | grep -o "\* \(.*\/\)*[A-Z]\{2,\}-[0-9]\+" | grep -o "[A-Z]\{2,\}-[0-9]\+")
if [ $? -ne 0 ]; then
    exit
fi

# fixup commit이면 스킵
FIXUP_COMMIT=$(grep -o "fixup\!" "$1")
if [ $? -eq 0 ]; then
    exit
fi

# 커밋 메시지 첫 줄 읽기
FIRST_LINE=$(head -n1 "$1")

# feat: 와 같은 타입이 있는지 체크
if echo "$FIRST_LINE" | grep -qE '^(feat|fix|chore|docs|refactor|test|style|perf|build|ci|revert|design|improve|debug):'; then
    # 타입 뒤에 Jira 키 추가
    NEW_LINE=$(echo "$FIRST_LINE" | sed -E "s/^([a-z]+:)(.*)/\1 [$ISSUE_KEY]\2/")
    # 커밋 메시지 업데이트
    sed -i '' "1s/.*/$NEW_LINE/" "$1"
else
    # 타입이 없으면 그냥 맨 앞에 Jira 키 붙이기
    sed -i '' "1s/^/[$ISSUE_KEY] /" "$1"
fi

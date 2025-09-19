#!/bin/sh

# Merge commit이나 commit --amend는 스킵
if [ "$2" = "merge" ] || [ "$2" = "commit" ]; then
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
if echo "$FIRST_LINE" | grep -qE '^(feat|fix|chore|docs|refactor|test|style|perf|build|ci|revert):'; then
    # 타입 뒤에 Jira 키 추가
    NEW_LINE=$(echo "$FIRST_LINE" | sed -E "s/^([a-z]+:)(.*)/\1 [$ISSUE_KEY]\2/")
    # 커밋 메시지 업데이트
    sed -i -e "1s/.*/$NEW_LINE/" "$1"
else
    # 타입이 없으면 그냥 맨 앞에 Jira 키 붙이기
    sed -i -e "1s/^/[$ISSUE_KEY] /" "$1"
fi

import { useEffect, useRef, ReactNode } from "react";

type Props<T> = {
  items: T[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
  fetchNextPage: () => void;
  renderItem: (item: T, index: number, isLast: boolean) => ReactNode;
  renderLoading?: () => ReactNode;
  renderEmpty?: () => ReactNode;
  renderFetchingMore?: () => ReactNode;
  className?: string;
  threshold?: number;
};

const InfiniteScrollList = <T,>({
  items,
  hasNextPage = false,
  isFetchingNextPage = false,
  isLoading = false,
  fetchNextPage,
  renderItem,
  renderLoading,
  renderEmpty,
  renderFetchingMore,
  className = "space-y-4 max-h-[70vh] overflow-y-auto",
  threshold = 1.0,
}: Props<T>) => {
  const observerRef = useRef<IntersectionObserver>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤 감지
  useEffect(() => {
    if (isLoading) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold }
    );

    if (lastItemRef.current) {
      observerRef.current.observe(lastItemRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, items.length, threshold]);

  if (isLoading) {
    return renderLoading ? (
      renderLoading()
    ) : (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return renderEmpty ? (
      renderEmpty()
    ) : (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">항목이 없습니다</div>
      </div>
    );
  }

  return (
    <div className={className}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} ref={isLast ? lastItemRef : undefined}>
            {renderItem(item, index, isLast)}
          </div>
        );
      })}

      {isFetchingNextPage && (
        renderFetchingMore ? (
          renderFetchingMore()
        ) : (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-gray-500">더 많은 항목을 불러오는 중...</div>
          </div>
        )
      )}
    </div>
  );
};

export default InfiniteScrollList;
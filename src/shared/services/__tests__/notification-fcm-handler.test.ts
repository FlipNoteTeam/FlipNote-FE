import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, type InfiniteData } from "@tanstack/react-query";
import type { ApiResponse, CursorPagingResponse } from "@/shared/apis/types";
import type { NotificationResponse } from "@/shared/apis/notification";

// 테스트 전용 QueryClient — 모듈 mock보다 먼저 생성해야 factory에서 참조 가능
const testQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

vi.mock("@/shared/lib/query-client", () => ({
  queryClient: testQueryClient,
}));

vi.mock("@/shared/apis/notification", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/shared/apis/notification")>();
  return {
    ...actual,
    notificationApi: {
      ...actual.notificationApi,
      getNotifications: vi.fn(),
    },
  };
});

const { handleFCMMessage } = await import(
  "@/shared/services/notification-fcm-handler"
);
const { notificationApi, NOTIFICATIONS_QUERY_KEY } = await import(
  "@/shared/apis/notification"
);

type NotificationPage = ApiResponse<CursorPagingResponse<NotificationResponse>>;

const makeNotification = (id: number): NotificationResponse => ({
  notificationId: id,
  message: `알림 ${id}`,
  metadata: {},
  isRead: false,
  createdAt: new Date(id * 1000).toISOString(),
  groupId: null,
});

const makePage = (
  items: NotificationResponse[],
  hasNext = false,
): NotificationPage => ({
  success: true,
  data: { content: items, hasNext, nextCursor: undefined, size: items.length },
});

const makeInfiniteData = (
  pages: NotificationPage[],
): InfiniteData<NotificationPage> => ({
  pages,
  pageParams: pages.map((_, i) => (i === 0 ? undefined : `cursor-${i}`)),
});

const QUERY_KEY = [...NOTIFICATIONS_QUERY_KEY, undefined];

beforeEach(() => {
  testQueryClient.clear();
  vi.clearAllMocks();
});

describe("handleFCMMessage", () => {
  it("캐시가 없으면 invalidateQueries를 호출한다", async () => {
    vi.mocked(notificationApi.getNotifications).mockResolvedValue({
      data: makePage([makeNotification(10)]),
    } as never);

    const invalidateSpy = vi.spyOn(testQueryClient, "invalidateQueries");

    await handleFCMMessage();

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: NOTIFICATIONS_QUERY_KEY,
    });
  });

  it("신규 알림을 캐시 첫 페이지 앞에 prepend한다", async () => {
    const existing = [makeNotification(1), makeNotification(2)];
    testQueryClient.setQueryData(
      QUERY_KEY,
      makeInfiniteData([makePage(existing)]),
    );

    const newItem = makeNotification(3);
    vi.mocked(notificationApi.getNotifications).mockResolvedValue({
      data: makePage([newItem, ...existing]),
    } as never);

    await handleFCMMessage();

    const result = testQueryClient.getQueryData<InfiniteData<NotificationPage>>(QUERY_KEY);
    expect(result?.pages[0].data.content[0].notificationId).toBe(3);
    expect(result?.pages[0].data.content).toHaveLength(3);
  });

  it("이미 캐시에 있는 알림은 중복 추가하지 않는다", async () => {
    const existing = [makeNotification(1), makeNotification(2)];
    testQueryClient.setQueryData(
      QUERY_KEY,
      makeInfiniteData([makePage(existing)]),
    );

    // API가 동일한 항목만 반환
    vi.mocked(notificationApi.getNotifications).mockResolvedValue({
      data: makePage(existing),
    } as never);

    const setQueriesDataSpy = vi.spyOn(testQueryClient, "setQueriesData");

    await handleFCMMessage();

    expect(setQueriesDataSpy).not.toHaveBeenCalled();
  });

  it("여러 페이지가 로드된 상태에서 기존 페이지는 그대로 유지된다", async () => {
    const page1 = [makeNotification(3), makeNotification(2)];
    const page2 = [makeNotification(1)];
    testQueryClient.setQueryData(
      QUERY_KEY,
      makeInfiniteData([makePage(page1, true), makePage(page2)]),
    );

    const newItem = makeNotification(4);
    vi.mocked(notificationApi.getNotifications).mockResolvedValue({
      data: makePage([newItem, ...page1]),
    } as never);

    await handleFCMMessage();

    const result = testQueryClient.getQueryData<InfiniteData<NotificationPage>>(QUERY_KEY);
    expect(result?.pages).toHaveLength(2);
    expect(result?.pages[1].data.content).toEqual(page2);
    expect(result?.pages[0].data.content[0].notificationId).toBe(4);
  });

  it("API 호출이 실패해도 예외를 던지지 않는다", async () => {
    vi.mocked(notificationApi.getNotifications).mockRejectedValue(
      new Error("network error"),
    );

    await expect(handleFCMMessage()).resolves.not.toThrow();
  });
});

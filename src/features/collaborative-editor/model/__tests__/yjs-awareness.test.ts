import { Awareness, encodeAwarenessUpdate } from "y-protocols/awareness";
import { describe, expect, it, vi } from "vitest";
import * as Y from "yjs";
import { YjsAwareness } from "../yjs-awareness";
import { YjsDocument } from "../yjs-document";

describe("YjsAwareness", () => {
  it("로컬 편집자의 카드·필드·커서 상태를 관리한다", () => {
    const document = new YjsDocument();
    const awareness = new YjsAwareness(document.getYDoc());
    const onChange = vi.fn();
    awareness.onChange(onChange);

    awareness.setLocalState(
      "question",
      0,
      { id: "user-1", name: "Editor One" },
      { index: 2, length: 0 },
    );

    expect(onChange).toHaveBeenCalled();
    expect(awareness.getStates().get(document.getYDoc().clientID)).toMatchObject({
      user: { id: "user-1", name: "Editor One" },
      cardIndex: 0,
      field: "question",
      cursor: { index: 2, length: 0 },
    });
  });

  it("원격 awareness update를 적용한다", () => {
    const document = new YjsDocument();
    const awareness = new YjsAwareness(document.getYDoc());
    const remoteDocument = new Y.Doc();
    const remoteAwareness = new Awareness(remoteDocument);

    remoteAwareness.setLocalState({
      user: { id: "user-2", name: "Editor Two" },
      cardIndex: 1,
      field: "answer",
    });

    awareness.applyUpdate(
      encodeAwarenessUpdate(remoteAwareness, [remoteDocument.clientID]),
      "remote",
    );

    expect(awareness.getStates().get(remoteDocument.clientID)).toMatchObject({
      user: { id: "user-2", name: "Editor Two" },
      cardIndex: 1,
      field: "answer",
    });
  });
});

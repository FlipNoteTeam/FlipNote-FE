import { GROUP_CATEGORY_MAP } from "@/domain/group/types";
import { cardSetApi } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import { Label } from "@/shared/components/label";
import { useQuery } from "@tanstack/react-query";

type Props = {
  groupId: number;
  cardsetId: number;
};

const CardsetDetail = ({ groupId, cardsetId }: Props) => {
  const { data } = useQuery({
    queryKey: ["cardset", groupId, cardsetId],
    queryFn: () => cardSetApi.getCardSet(groupId, cardsetId),
  });

  const cardset = data?.data.data;

  if (!cardset) return null;

  const categories = cardset.category ? cardset.category.split(",") : [];
  const hashtags = cardset.hashtag ? cardset.hashtag.split(",") : [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex gap-6">
        <div className="w-1/3">
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
            {cardset.imageUrl ? (
              <img
                src={cardset.imageUrl}
                alt={cardset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                t��
              </div>
            )}
          </div>
        </div>

        {/* $x�: � */}
        <div className="flex-1 space-y-4">
          {/* t�K� */}
          <div>
            <p className="text-lg font-medium mt-1">{cardset.name}</p>
          </div>

          <div>
            <Label className="text-sm text-gray-600">카테고리</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {GROUP_CATEGORY_MAP[
                    category as keyof typeof GROUP_CATEGORY_MAP
                  ] || category}
                </span>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm text-gray-600">해시태그</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <div className="text-sm text-gray-600">
          {cardset.publicVisible ? (
            <p>공개</p>
          ) : (
            <span className="text-red-500">비공개</span>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline">수정</Button>
          <Button variant="outline">삭제</Button>
        </div>
      </div>
    </div>
  );
};

export default CardsetDetail;

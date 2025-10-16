import type { CardSetSummaryResponse } from "@/shared/apis/card-set";
import { Card, CardContent } from "@/shared/components/card";

type CardsetCardProps = {
  cardset: CardSetSummaryResponse;
  onClick?: () => void;
};

export const CardsetCard = ({ cardset, onClick }: CardsetCardProps) => {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {cardset.imageUrl && (
          <img
            src={cardset.imageUrl}
            alt={cardset.name}
            className="mb-3 h-40 w-full rounded-lg object-cover"
          />
        )}
        <h3 className="mb-2 text-lg font-semibold">{cardset.name}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {cardset.category}
          </span>
          {cardset.hashtag && (
            <span className="text-muted-foreground text-xs">
              #{cardset.hashtag}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
